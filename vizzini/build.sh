#!/bin/bash

set -xeuo pipefail

folder=~/Downloads/vizzini
movie_crop=$folder/movie_crop.mp4
guitar=$folder/guitar.mp4
sheet=$folder/vizzini.png
video=$folder/video.mp4
shifted_click=$folder/shifted_click.mp3
vizzini=$folder/vizzini.mp4
python3 finish.py $movie_crop $guitar $sheet $video &&
  rm $vizzini &&
  ffmpeg -i $video -i $shifted_click -map 0:0 -map 1:0 -c:v copy -c:a copy -vcodec libx264 $vizzini &&
  open $vizzini
