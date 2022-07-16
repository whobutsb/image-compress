import fs from 'node:fs';
import {execFile} from 'node:child_process';
import mozjpeg from 'mozjpeg';
import { execSync } from 'child_process';
import { intervalToDuration } from 'date-fns';
import Promise from 'bluebird';
import chalk from 'chalk';
const log = console.log;
import ProgressBar from 'progress';

export default class CompressImages {

  constructor(directory, options){
    this.directory = directory;
    this.options = options;
    this.original_size = 0;
    this.compressed_size = 0;
    this.total_images = 0;
    this.start_time = new Date();
    this.end_time = new Date();
  }

  async handle(){
    const tasks = await this.buildTasks(this.directory);
    if(!tasks.length){ log(chalk.red('No images to compress. Exiting.')); return; }

    this.progress = new ProgressBar(`:bar :current/:total Elapsed: :elapseds ETA: :etas`, { 
      width: 40,
      total: tasks.length,
      complete: '\u001b[42m \u001b[0m',
      incomplete: '\u001b[41m \u001b[0m',
    });

    this.total_images = tasks.length;
    log(`
      ${chalk.bold('Directory:')} ${chalk.white(this.directory)}
      ${chalk.bold('Total Images:')} ${chalk.white(this.total_images)}
      ${chalk.bold('Concurrency:')} ${chalk.white(this.options.concurrency)}
      ${chalk.bold('Delete Files:')} ${chalk.white(this.options.delete_files)}
      ${chalk.bold('Quality:')} ${chalk.white(this.options.quality)}
      ${chalk.bold('Prefix:')} ${chalk.white(this.options.prefix)}
    `);

    await Promise.map(tasks, (job) => {
      return this.handleJPEG(job.fileName, job.filePath, job.directory);
    }, {concurrency: this.options.concurrency});  

    this.end_time = new Date();
    const { minutes, seconds } = this.elapsedTime();

    log(chalk.green(`
      Total Images: ${this.total_images}
      Original Size: ${this.original_size.toFixed(3)} MB
      Compressed Size: ${this.compressed_size.toFixed(3)} MB
      Compressed Percentage: ${this.savedPercentage()}%
      Elapsed Time: ${minutes}:${seconds}
    `));
  }

  elapsedTime(){
    return intervalToDuration({ start: this.start_time, end: this.end_time });
  }

  savedPercentage(){
    return Number(
      Math.abs(
        this.compressed_size * (100 / this.original_size) - 100
      ).toFixed(2)
    );
  }

  buildTasks(directory){
    const self = this;
    return new Promise((resolve, reject) => {
      let tasks = [];
      fs.readdirSync(directory).forEach(function(fileName){
        const filePath = `${directory}/${fileName}`;

        const mime = self.getMimeFromPath(filePath);
        if(mime === 'image/jpeg'){
          tasks.push({
            mimeType: mime,
            fileName: fileName, 
            filePath: filePath, 
            directory: directory
          });
        }
      });
      resolve(tasks);
    });
  }

  getMimeFromPath(filePath){
    const mimeType = execSync('file --mime-type -b "' + filePath + '"').toString();
    return mimeType.trim();
  }

  handleJPEG(fileName, filePath, directory){
    const self = this;
    return new Promise(async (resolve, reject) => {

      self.original_size += self.getFileSize(filePath);

      const output = `${directory}/${self.options.prefix}${fileName}`

      await this.compressJPEG(self.options.quality, output, filePath);

      self.compressed_size += self.getFileSize(output);

      self.deleteFile(filePath);

      this.progress.tick();

      resolve();
    });
  }

  compressJPEG(quality, output, filePath){
    return new Promise((resolve, reject) => {
      execFile(
        mozjpeg,
        ['-quality', `${quality}`, '-outfile', output, filePath],
        (err) => {
          if (err) {
            console.log(err)
            reject();
          }
          resolve();
        }
      );
    });
  }

  deleteFile(filePath){
    if(this.options.delete_files){
      fs.unlinkSync(filePath);
    }
  }

  getFileSize(filePath){
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    return bytes / (1024*1024);
  }
}
