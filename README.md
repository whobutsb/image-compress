# Image Compress

Compress a directory of JPEG images quickly using [mozjpeg](https://github.com/imagemin/mozjpeg-bin).

## Installation

```
$ git clone https://github.com/whobutsb/image-compress.git
$ cd image-compress
$ npm link
```

## Usage

```
$ imagecom -h

Usage: compress [options] <directory>

Compress images quickily.

Arguments:
  directory                   Directory of images to compress.

Options:
  -d --delete                 Delete the images after compressed.
  -q --quality <integer>      JPEG Quality. (default: 70)
  -c --concurrency <integer>  The number of concurrent images to compress. (default: 8)
  -p --prefix <string>        Add a prefix to the compressed files.
  -h, --help                  display help for command
```

## Example Command

``` 
$ imagecom /path/to/images -d -c 8 -p min- 
```

## Contributing

- Fork the repository. 
- Create a feature branch `git checkout -b new-feature`
- Add your changes `git add .`
- Commit your changes `git commit -am 'My new feature'`
- Push to your branch `git push origin new-feature`
- Submit a pull request

## Future Updates

- [ ] Add Tests
- [ ] Add support for PNG
- [ ] Add support for GIF
- [ ] Add support for single images
- [ ] Add support for output directory
- [ ] Add support for suffix of compressed images


## License

MIT License @ Steve Barbera
