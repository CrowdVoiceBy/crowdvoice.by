'use strict'

module.exports = {
  toOgv : 'ffmpeg -i {input-path} -strict -2 -c:v libtheora -b:v 1024k -maxrate 1024k -bufsize 1200k -r 30 -q:v 3 -vf scale=-1:720 -threads 0 {output-dir}/{output-file}.ogv',
  // toWebm : 'ffmpeg -i {input-path} -codec:v libvpx -quality good -cpu-used 0 -b:v 1024k -maxrate 1024k -bufsize 1200k -qmin 10 -qmax 42 -vf scale=-1:720 -threads 0 {output-dir}/{output-file}.webm',
  toMp4 : 'ffmpeg -i {input-path} -strict -2 -c:v libx264 -b:v 1024k -maxrate 1024k -bufsize 1200k -r 30 -vf scale=-1:720 -threads 0 {output-dir}/{output-file}.mp4'
}
