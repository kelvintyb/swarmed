var canvas2DSupported = !!window.CanvasRenderingContext2D;

var initFunc = function() {
  $('h1').text('Canvas is supported');

}

if (canvas2DSupported) {
  console.log('Linked')
  initFunc();




}
