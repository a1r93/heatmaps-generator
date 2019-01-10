# heatmaps-generator

Demo: https://codepen.io/a1r93/pen/ebLobq

This small project was written in pure JavaScript using no framework. The purpose of it is to generate a heatmap based on the time the mouse was pressed (the longer the press on a same position, the higher the intensity thus the brighter the color).

The objective was to make streamlines aswell that would be attracted by the heatmaps that have the highest intensity, but that goal isn't achieved yet. The basic logic and the rendering of the streamlines is written, but the function that should return the next position (i.e. the position that pushes the particle to come closer to the higher intensity area) doesn't seem to be working fine. To be followed...

## Note

The expected behaviour of the streamlines is not as intended. There seems to be a bug but I can't seem to find where it comes from... This small project is still in progress until the streamlines act as expected: they should be attracted by the cells where the intensity is the highest.
