#!/usr/bin/env node
import { program } from 'commander';
import CompressImages from './CompressImages.js';

// Example Command: node index.js /path/to/images -d -c 8 -p min-

program
  .name('compress')
  .description('Compress images quickily.')
  .argument('<directory>', 'Directory of images to compress.')
  .option('-d --delete', 'Delete the images after compressed.')
  .option('-q --quality <integer>',  'JPEG Quality.', 70)
  .option('-c --concurrency <integer>', 'The number of concurrent images to compress.', 8)
  .option('-p --prefix <string>', 'Add a prefix to the compressed files.')
  .action((directory, options) => {
    const compress = new CompressImages(directory, {
      delete_files: options.delete ? true : false,
      quality: parseInt(options.quality),
      concurrency: parseInt(options.concurrency),
      prefix: options.prefix ? options.prefix : '',
    });
    compress.handle();
  });

program.parse();
