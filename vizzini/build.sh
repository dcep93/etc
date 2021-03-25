#!/bin/bash

set -xeuo pipefail

folder=~/Downloads/vizzini
movie_crop=$folder/movie_crop.mp4
guitar=$folder/guitar.mp4
sheet=$folder/vizzini.png
video=$folder/video.mp4
audio=$folder/final.mp3
vizzini=$folder/vizzini.mp4

offset=$(ffprobe -v 0 -show_entries stream=start_time -of default=nw=1 "$audio" | awk -F '=' '{print $2}')

date

python3 finish.py $movie_crop $guitar $sheet $video &&
  rm -f "$vizzini" &&
  ffmpeg -i "$video" -itsoffset -"$offset" -i "$audio" -map 0:0 -map 1:0 -c copy -c:a copy -vcodec libx264 "$vizzini" &&
  open "$vizzini"

date
