/**
 * Detect whether we're having access to the internet
 */
let online = navigator.onLine;
if(online){ 
  console.log("There's online access!"); 
} else {
  console.log("Internet connection seems down, enabling offline mode!")
}

/* 
* Detect DOM ready - https://stackoverflow.com/a/7053197 
*/
function pageReady(callback){
  // in case the document is already rendered
  if (document.readyState!='loading') callback();
  // modern browsers
  else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
  // IE <= 8
  else document.attachEvent('onreadystatechange', function(){
      if (document.readyState=='complete') callback();
  });
}

pageReady(function(){
  console.log('Page is ready, let\'s throw in some javascript');

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCcOjsLNFrzEgI0diLs8hmpNxw8e7lr5YU&&libraries=places&callback=initMap';
  document.body.appendChild(script);
  initPage();   // carry out page specific initializations, found in js file of that page
});


/*
* Lazy loading - Based on https://www.robinosborne.co.uk/2016/05/16/lazy-loading-images-dont-rely-on-javascript/
*/
registerListener('load', setLazy);
registerListener('load', lazyLoad);
registerListener('scroll', lazyLoad);

var lazy = [];

function setLazy(){
    lazy = document.getElementsByClassName('lazy');
    console.log('[LL] Found ' + lazy.length + ' lazy images');
} 

function cleanLazy(){
  lazy = Array.prototype.filter.call(lazy, function(l){ return l.getAttribute('data-src');});
}

function lazyLoad(){
    for(var i=0; i<lazy.length; i++){
        if(isInViewport(lazy[i])){
            // swap src
            if (lazy[i].getAttribute('data-src')){
                lazy[i].src = lazy[i].getAttribute('data-src');
                lazy[i].removeAttribute('data-src');
            }
            // swap srcset
            if (lazy[i].getAttribute('data-srcset')){
              lazy[i].setAttribute("srcset", lazy[i].getAttribute('data-srcset'));
              lazy[i].removeAttribute('data-srcset');
          }
          console.log('[LL] Image loaded');        
        } else {
            console.log(`[LL] Image checked but not in viewport...`);
        }
    }

    cleanLazy();
    
}

function isInViewport(el){
    var rect = el.getBoundingClientRect();
    
    return (
        rect.bottom >= 0 && 
        rect.right >= 0 && 
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) && 
        rect.left <= (window.innerWidth || document.documentElement.clientWidth)
     );
}

function registerListener(event, func) {
    if (window.addEventListener) {
        window.addEventListener(event, func)
    } else {
        window.attachEvent('on' + event, func)
    }
}