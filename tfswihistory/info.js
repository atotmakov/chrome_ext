function renderCells(cells, data, revisionsAutors) {
  var tbody = document.getElementById('tbody');

  for (const [key, value] of Object.entries(data)) {
      var tr = "<tr class = 'rendered'>";

      var s = '<table>'

      var i = 0;
      for( const v of value ){
        var author = revisionsAutors[v.rev].author + ' ' + revisionsAutors[v.rev].dt;
        s += '<tr = class="values"><td>' + v.val + '</td><td class = "rev">' + author + ' [rev:' + v.rev + ']</td></tr>';
      }
            
      s += '</table>';

      tr += '<td class="key">' + key + '</td>' + '<td>' + s + '</td></tr>';

      tbody.innerHTML += tr;
  }
};


/**
 * Returns true if the supplies object has no properties.
 */
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

/**
 * Resizes the window to the current dimensions of this page's body.
 */
function resizeWindow() {
  window.setTimeout(function() {
    chrome.tabs.getCurrent(function (tab) {
      var newHeight = Math.min(document.body.offsetHeight + 140, 700);
      chrome.windows.update(tab.windowId, {
        height: newHeight,
        width: 520
      });
    });
  }, 150);
};

/**
 * Called directly by the background page with information about the
 * image.  Outputs image data to the DOM.
 */
function renderImageInfo(imageinfo, revisionsAutors) {
  //console.log('imageinfo', imageinfo);

  var divloader = document.querySelector('#loader');
  var divoutput = document.querySelector('#output');
  divloader.style.display = "none";
  divoutput.style.display = "block";

  var divinfo = document.querySelector('#info');
  var divexif = document.querySelector('#exif');

  // Render general image data.
  var datacells = divinfo.querySelectorAll('td');
  renderCells(datacells, imageinfo, revisionsAutors);

  // If EXIF data exists, unhide the EXIF table and render.
  /*if (imageinfo['exif'] && !isEmpty(imageinfo['exif'])) {
    divexif.style.display = 'block';
    var exifcells = divexif.querySelectorAll('td');
    renderCells(exifcells, imageinfo['exif']);
  }*/
};

/**
 * Renders the URL for the image, trimming if the length is too long.
 */
function renderUrl(title, url) {
  var divurl = document.querySelector('#url');
    
  
  var urltext = title;
  var anchor = document.createElement('a');
  anchor.href = url;
  anchor.innerText = urltext;
  divurl.appendChild(anchor);
};

/**
 * Renders a thumbnail view of the image.
 */
function renderThumbnail(url) {
  var canvas = document.querySelector('#thumbnail');
  var context = canvas.getContext('2d');

  canvas.width = 100;
  canvas.height = 100;

  var image = new Image();
  image.addEventListener('load', function() {
    var src_w = image.width;
    var src_h = image.height;
    var new_w = canvas.width;
    var new_h = canvas.height;
    var ratio = src_w / src_h;
    if (src_w > src_h) {
      new_h /= ratio;
    } else {
      new_w *= ratio;
    }
    canvas.width = new_w;
    canvas.height = new_h;
    context.drawImage(image, 0, 0, src_w, src_h, 0, 0, new_w, new_h);
  });
  image.src = url;
};

/**
 * Returns a function which will handle displaying information about the
 * image once the ImageInfo class has finished loading.
 */

function formatDateTimeSkipOther(str) {
 var res = str; //str = "2019-10-17T08:56:08.573Z"
  if (str[4]=='-' && str[7]=='-' && str[10]=='T' && str[13]==':' && str[16]==':' && str[19]=='.') {
    var dt = new Date(str);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit' };
    res = dt.toLocaleDateString(undefined,options);
  }
  return  res;
}


function getImageInfoHandler(tfs_url, wi_id) {
  return function() {
    
    var urljson = tfs_url + '/_apis/wit/workItems/' + wi_id + '/revisions?api-version=5.1'
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", urljson, true ); // false for synchronous request

    xmlHttp.onload = function (e) {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
          getImageInfoHandler1(tfs_url, wi_id, xmlHttp.responseText);
        } else {
          console.error(xmlHttp.statusText);
        }
      }
    };
    xmlHttp.onerror = function (e) {
      console.error(xmlHttp.statusText);
    };
    xmlHttp.send( null );
}

function getImageInfoHandler1(tfs_url, wi_id, response) {

//    var obj = JSON.parse(xmlHttp.response);
    var obj = JSON.parse(response);
    var f = obj.value[0].fields;
    var s = f['System.Title'];
    
    var revisionsAutors = [];
    var fieldsset = [];

    var i = 0;
    for (; i<obj.count; i++) {
      var d = obj.value[i].fields;
      for (const [key, value] of Object.entries(d)) {
        var string_value = value;
        if (typeof value !== 'string' && value['displayName']) {
          string_value = value['displayName'];
        }
        string_value = formatDateTimeSkipOther(string_value);
        if (!revisionsAutors[i]) {
          revisionsAutors[i] = {author: '', dt: ''};
        }
        if (key=='System.ChangedBy') {
          revisionsAutors[i].author = string_value;
        }
        else if (key=='System.ChangedDate') {
          revisionsAutors[i].dt = string_value;
        }
        else {
         if (fieldsset[key]) {
            if (fieldsset[key][fieldsset[key].length-1].val != string_value)
              fieldsset[key].push({rev:i, val:string_value});
          }
          else 
            fieldsset[key] = [{rev: i,val: string_value}]
        } 
      }
    }
    
    

    renderUrl(wi_id + ':' + s, tfs_url + '/_workitems/edit/' + wi_id);
    //renderThumbnail(url);
    //var imageinfo = ImageInfo.getAllFields(url);
    renderImageInfo(fieldsset, revisionsAutors);
    resizeWindow();
  };
};

/**
 * Load the image in question and display it, along with its metadata.
 */
document.addEventListener("DOMContentLoaded", function () {
  // The URL of the image to load is passed on the URL fragment.
  var wi_id = window.location.hash.substring(1);
  var tfs_url = window.location.search.substring(1);
  if (tfs_url) {
    // Use the ImageInfo library to load the image and parse it.
    getImageInfoHandler(tfs_url, wi_id)();
    //ImageInfo.loadInfo(imageUrl, getImageInfoHandler(imageUrl));
  }
});
