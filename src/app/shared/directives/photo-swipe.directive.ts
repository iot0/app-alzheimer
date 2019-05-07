import { Directive, ElementRef, OnInit, HostListener, AfterViewInit, Renderer2 } from "@angular/core";
import PhotoSwipe from "photoswipe";
import PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default";
import { Platform } from "@ionic/angular";

@Directive({
  selector: "[appPhotoSwipe]"
})
export class PhotoSwipeDirective implements OnInit, AfterViewInit {
  // id="1";
  constructor(private elementRef: ElementRef, private platform: Platform,private renderer:Renderer2) {}

  ngAfterViewInit(): void {
    // this.renderer.setAttribute(this.elementRef.nativeElement,'data-pswp-uid',this.id);
    // // Parse URL and open gallery if it contains #&pid=3&gid=1
    // var hashData = this.photoswipeParseHash();
    // if (hashData.pid && hashData.gid) {
    //   this.openPhotoSwipe(hashData.pid, this.elementRef.nativeElement, true, true);
    // }
  }
  ngOnInit(): void {}
  // parse slide data (url, title, size ...) from DOM elements
  // (children of gallerySelector)
  parseThumbnailElements(el) {
    var thumbElements = el.childNodes,
      numNodes = thumbElements.length,
      items = [],
      figureEl,
      linkEl,
      size,
      item;

    for (var i = 0; i < numNodes; i++) {
      figureEl = thumbElements[i]; // <figure> element

      // include only element nodes
      if (figureEl.nodeType !== 1) {
        continue;
      }

      linkEl = figureEl.children[0]; // <a> element

      // size = linkEl.getAttribute("data-size").split("x");

      // // create slide object
      // item = {
      //   src: linkEl.getAttribute("href"),
      //   w: parseInt(size[0], 10),
      //   h: parseInt(size[1], 10)
      // };

      // get size from img
      let img = linkEl.getElementsByTagName("img")[0];
      let width = img.clientWidth;
      let height = img.clientHeight;
      let size = this.calcImageSize(width, height);
      // create slide object
      item = {
        src: linkEl.getAttribute("href"),
        w: size.w,
        h: size.h
      };

      if (figureEl.children.length > 1) {
        // <figcaption> content
        item.title = figureEl.children[1].innerHTML;
      }

      if (linkEl.children.length > 0) {
        // <img> thumbnail element, retrieving thumbnail url
        item.msrc = linkEl.children[0].getAttribute("src");
      }

      item.el = figureEl; // save link to element for getThumbBoundsFn
      items.push(item);
    }

    return items;
  }

  // find nearest parent element
  closest(el, fn) {
    return el && (fn(el) ? el : this.closest(el.parentNode, fn));
  }

  // triggers when user clicks on thumbnail
  @HostListener("click")
  onThumbnailsClick(e) {
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : (e.returnValue = false);

    var eTarget = e.target || e.srcElement;

    // find root element of slide
    var clickedListItem = this.closest(eTarget, function(el) {
      return el.tagName && el.tagName.toUpperCase() === "FIGURE";
    });

    if (!clickedListItem) {
      return;
    }

    // find index of clicked item by looping through all child nodes
    // alternatively, you may define index via data- attribute
    var clickedGallery = clickedListItem.parentNode,
      childNodes = clickedListItem.parentNode.childNodes,
      numChildNodes = childNodes.length,
      nodeIndex = 0,
      index;

    for (var i = 0; i < numChildNodes; i++) {
      if (childNodes[i].nodeType !== 1) {
        continue;
      }

      if (childNodes[i] === clickedListItem) {
        index = nodeIndex;
        break;
      }
      nodeIndex++;
    }

    if (index >= 0) {
      // open PhotoSwipe if valid index found
      this.openPhotoSwipe(index, clickedGallery, false, false);
    }
    return false;
  }

  openPhotoSwipe(index, galleryElement, disableAnimation, fromURL) {
    var pswpElement = document.querySelectorAll(".pswp")[0],
      gallery,
      options,
      items;

    items = this.parseThumbnailElements(galleryElement);

    // define options (if needed)
    options = {
      // define gallery index (for URL)
      galleryUID: galleryElement.getAttribute("data-pswp-uid"),

      getThumbBoundsFn: function(index) {
        // See Options -> getThumbBoundsFn section of documentation for more info
        var thumbnail = items[index].el.getElementsByTagName("img")[0], // find thumbnail
          pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
          rect = thumbnail.getBoundingClientRect();

        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
      }
    };

    // PhotoSwipe opened from URL
    if (fromURL) {
      if (options.galleryPIDs) {
        // parse real index when custom PIDs are used
        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
        for (var j = 0; j < items.length; j++) {
          if (items[j].pid == index) {
            options.index = j;
            break;
          }
        }
      } else {
        // in URL indexes start from 1
        options.index = parseInt(index, 10) - 1;
      }
    } else {
      options.index = parseInt(index, 10);
    }

    // exit if index not found
    if (isNaN(options.index)) {
      return;
    }

    if (disableAnimation) {
      options.showAnimationDuration = 0;
    }
    options.history=false;
    // Pass data to PhotoSwipe and initialize it
    gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
    gallery.init();
  }

  // parse picture index and gallery index from URL (#&pid=1&gid=2)
  photoswipeParseHash() {
    let hash = window.location.hash.substring(1),
      params: any = {};

    if (hash.length < 5) {
      return params;
    }

    var vars = hash.split("&");
    for (var i = 0; i < vars.length; i++) {
      if (!vars[i]) {
        continue;
      }
      var pair = vars[i].split("=");
      if (pair.length < 2) {
        continue;
      }
      params[pair[0]] = pair[1];
    }

    if (params.gid) {
      params.gid = parseInt(params.gid, 10);
    }

    return params;
  }

  calcImageSize(width, height) {
    console.log("==========================START===============================");
    console.log(`Found:${width}x${height}`);
    let maxWidth = this.platform.width(); // Max width for the image
    let maxHeight = this.platform.height(); // Max height for the image
    // let maxWidth = window.screen.width; // Max width for the image
    // let maxHeight = window.screen.height;    // Max height for the image
    let ratio = 0; // Used for aspect ratio
    console.log(`Max:${maxWidth}x${maxHeight}`);
    // Check if the current width is larger than the max
    if (width < maxWidth) {
      ratio = maxWidth / width; // get ratio for scaling image
      height = height * ratio; // Reset height to match scaled image
      width = width * ratio; // Reset width to match scaled image
    }

    // Check if current height is larger than max
    if (height < maxHeight) {
      ratio = maxHeight / height; // get ratio for scaling image
      width = width * ratio; // Reset width to match scaled image
      height = height * ratio; // Reset height to match scaled image
    }
    console.log(`Ratio:${ratio}`);

    console.log(`Calc:${width}x${height}`);
    return { w: width, h: height };
  }
}
