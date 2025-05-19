/*
 * Pokemon Theme Widget
 * A widget for displaying a random pokemon and a colour theme matching it.
 *
 * SUPPORTS
 * This script supports only medium widgets.
 *
 * INTERACTIONS
 * You can tap the widget to be brought to a UI Table where you can copy the colours of a pokemon
 */

// Check if you tapped on the widget
if (args.queryParameters.data) {
  const data = JSON.parse(args.queryParameters.data);
  await showTable(data);
  return;
}

// Otherwise, we make the widget
const cacheFileName = "pokemon-theme-cache.json";

let isErrorLoadingData = false;
const { name, subtitle, id, palette } = await getRandomData();
const onClick =
  URLScheme.forRunningScript() +
  "?data=" +
  encodeURIComponent(`${JSON.stringify({ name, subtitle, id, palette })}`);

const widget = await htmlWidget(
  `
  <widget url="${onClick}">
    <style>
      widget {
        refresh-after-date: 10;
        background: to top right, #fff-#030711, ${palette[0]};
        spacing: 5;
      }
      stack {
        spacing: 5
      }
      .header {
        layout: horizontally;
        align-content: center;
      }
      img {
        image-size: 75, 75;
      }
      .title {
        font: boldSystemFont, 20;
      }
      .subtitle {
        text-color: #64748b-#7f8ea3
      }
      .gradient {
        background: to right, ${palette.join(",")};
        corner-radius: 5;
        font: regularSystemFont, 2;
      }
      .circle {
        size: 25, 25;
        corner-radius: 100;
      }
      .pill {
        padding: 2, 5;
        corner-radius: 100;
        line-limit: 1;
        font: regularSystemFont, 12;
        minimumScaleFactor: 90%;
      }
      .colour-0 {
        background: ${palette[0]};
        text-color: ${colourIsDark(palette[0]) ? "#fff" : "#000"};
      }
      .colour-1 {
        background: ${palette[1]};
        text-color: ${colourIsDark(palette[1]) ? "#fff" : "#000"};
      }
      .colour-2 {
        background: ${palette[2]};
         text-color: ${colourIsDark(palette[2]) ? "#fff" : "#000"};
      }
    </style>

    <stack class="header">
      <!-- If there was an error loading the data, then the image will likely not load, so hide it -->
      ${
        !isErrorLoadingData &&
        `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png"/>`
      }
      <stack layout="vertically" spacing="2">
        <text class="title">${name.toUpperCase()}</text>
        <text class="subtitle">${subtitle}</text>
        <!-- The gradient stack needs a text element for it to display with the proper height -->
        <stack class="gradient">
          <spacer/>
          <text> </text>
        </stack>
      </stack>
    </stack>

    <stack layout="horizontally">
      ${palette.map(
        (colour, index) => `
        <stack layout="vertically">
          <stack layout="horizontally">
            <spacer/>
            <stack class="circle colour-${index}"></stack>
            <spacer/>
          </stack>
          <stack layout="horizontally">
            <spacer/>
            <stack class="pill colour-${index}">
              <text>${colour}</text>
            </stack>
            <spacer/>
          </stack>
        </stack>
      `
      )}
    </stack>
  </widget>
  `,
  true
);

widget.presentMedium();
Script.setWidget(widget);
Script.complete();

// Function that loads random pokemon data
async function getRandomData() {
  // As of now (May, 2025), the highest id is 1025
  const randId = randomInt(1, 1025);

  // Check if the pokemon has been cached
  const cache = await loadCache();
  if (randId in cache) {
    return cache[randId];
  }

  // Try to load the data
  try {
    const data = await loadData(randId);
    await cacheData(data, cache);
    return data;
  } catch {
    // There likely was an internet error, so get one of the cached pokemon
    isErrorLoadingData = true;
    const randKeyIndex = randomInt(0, Object.keys(cache).length);
    const randKey = Object.keys(cache)[randKeyIndex];
    return cache[randKey];
  }
}

// Function that loads the cached pokemon data
async function loadCache() {
  // Set up variables for working with the file
  const fm = FileManager.iCloud();
  const baseDir = fm.documentsDirectory();
  const file = fm.joinPath(baseDir, cacheFileName);

  // If the file does not exist, write the basic object
  if (!fm.fileExists(file)) {
    const defaultFile = {
      1: {
        name: "bulbasaur",
        subtitle: "Seed Pokémon",
        palette: ["#55a480", "#35141a", "#d8b87f"],
        id: 1,
      },
    };
    fm.writeString(file, JSON.stringify(defaultFile));
    return defaultFile;
  }
  // Read and return the file
  if (!fm.isFileDownloaded(file)) {
    await fm.downloadFileFromiCloud(file);
  }
  return JSON.parse(fm.readString(file));
}

// Function to add pokemon data to the cache
async function cacheData(data, cache) {
  // Update the cached object
  const cacheObject = cache ?? (await loadCache());
  cacheObject[data.id] = data;

  // Overwrite the cache
  const fm = FileManager.iCloud();
  const baseDir = fm.documentsDirectory();
  const file = fm.joinPath(baseDir, cacheFileName);
  fm.writeString(file, JSON.stringify(cacheObject));
}

// Function to load the pokemon data from the api, and find the palette
async function loadData(randId) {
  const pokemonApiReq = new Request(
    `https://pokeapi.co/api/v2/pokemon/${randId}/`
  );
  const pokemonData = await pokemonApiReq.loadJSON();

  const pokemonSubtitleReq = new Request(
    `https://pokeapi.co/api/v2/pokemon-species/${randId}/`
  );
  const pokemonSubtitleData = await pokemonSubtitleReq.loadJSON();
  const subtitle =
    pokemonSubtitleData.genera.find(
      (subtitleObj) => subtitleObj.language.name === "en"
    )?.genus ?? "Unknown";

  const w = new WebView();
  const palette = await w.evaluateJavaScript(
    `
    // This is a minified version of Color Thief used to get the palette.
    // If you do not trust this, you can replace it with the version here: https://github.com/lokesh/color-thief/blob/master/dist/color-thief.min.js
    // The current version being  used is 2.5.0
    !function(t,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):(t||self).ColorThief=n()}(this,function(){var t=function(t,n){return t<n?-1:t>n?1:0},n=function(t){return t.reduce(function(t,n){return t+n},0)},r=/*#__PURE__*/function(){function t(t){this.colors=t}var n=t.prototype;return n.palette=function(){return this.colors},n.map=function(t){return t},t}(),o=function(){function o(t,n,r){return(t<<10)+(n<<5)+r}function e(t){var n=[],r=!1;function o(){n.sort(t),r=!0}return{push:function(t){n.push(t),r=!1},peek:function(t){return r||o(),void 0===t&&(t=n.length-1),n[t]},pop:function(){return r||o(),n.pop()},size:function(){return n.length},map:function(t){return n.map(t)},debug:function(){return r||o(),n}}}function i(t,n,r,o,e,i,u){var a=this;a.r1=t,a.r2=n,a.g1=r,a.g2=o,a.b1=e,a.b2=i,a.histo=u}function u(){this.vboxes=new e(function(n,r){return t(n.vbox.count()*n.vbox.volume(),r.vbox.count()*r.vbox.volume())})}function a(t,n){if(n.count()){var r=n.r2-n.r1+1,e=n.g2-n.g1+1,i=Math.max.apply(null,[r,e,n.b2-n.b1+1]);if(1==n.count())return[n.copy()];var u,a,c,f,s=0,h=[],l=[];if(i==r)for(u=n.r1;u<=n.r2;u++){for(f=0,a=n.g1;a<=n.g2;a++)for(c=n.b1;c<=n.b2;c++)f+=t[o(u,a,c)]||0;h[u]=s+=f}else if(i==e)for(u=n.g1;u<=n.g2;u++){for(f=0,a=n.r1;a<=n.r2;a++)for(c=n.b1;c<=n.b2;c++)f+=t[o(a,u,c)]||0;h[u]=s+=f}else for(u=n.b1;u<=n.b2;u++){for(f=0,a=n.r1;a<=n.r2;a++)for(c=n.g1;c<=n.g2;c++)f+=t[o(a,c,u)]||0;h[u]=s+=f}return h.forEach(function(t,n){l[n]=s-t}),function(t){var r,o,e,i,a,c=t+"1",f=t+"2",v=0;for(u=n[c];u<=n[f];u++)if(h[u]>s/2){for(e=n.copy(),i=n.copy(),a=(r=u-n[c])<=(o=n[f]-u)?Math.min(n[f]-1,~~(u+o/2)):Math.max(n[c],~~(u-1-r/2));!h[a];)a++;for(v=l[a];!v&&h[a-1];)v=l[--a];return e[f]=a,i[c]=e[f]+1,[e,i]}}(i==r?"r":i==e?"g":"b")}}return i.prototype={volume:function(t){var n=this;return n._volume&&!t||(n._volume=(n.r2-n.r1+1)*(n.g2-n.g1+1)*(n.b2-n.b1+1)),n._volume},count:function(t){var n=this,r=n.histo;if(!n._count_set||t){var e,i,u,a=0;for(e=n.r1;e<=n.r2;e++)for(i=n.g1;i<=n.g2;i++)for(u=n.b1;u<=n.b2;u++)a+=r[o(e,i,u)]||0;n._count=a,n._count_set=!0}return n._count},copy:function(){var t=this;return new i(t.r1,t.r2,t.g1,t.g2,t.b1,t.b2,t.histo)},avg:function(t){var n=this,r=n.histo;if(!n._avg||t){var e,i,u,a,c=0,f=0,s=0,h=0;if(n.r1===n.r2&&n.g1===n.g2&&n.b1===n.b2)n._avg=[n.r1<<3,n.g1<<3,n.b1<<3];else{for(i=n.r1;i<=n.r2;i++)for(u=n.g1;u<=n.g2;u++)for(a=n.b1;a<=n.b2;a++)c+=e=r[o(i,u,a)]||0,f+=e*(i+.5)*8,s+=e*(u+.5)*8,h+=e*(a+.5)*8;n._avg=c?[~~(f/c),~~(s/c),~~(h/c)]:[~~(8*(n.r1+n.r2+1)/2),~~(8*(n.g1+n.g2+1)/2),~~(8*(n.b1+n.b2+1)/2)]}}return n._avg},contains:function(t){var n=this,r=t[0]>>3;return gval=t[1]>>3,bval=t[2]>>3,r>=n.r1&&r<=n.r2&&gval>=n.g1&&gval<=n.g2&&bval>=n.b1&&bval<=n.b2}},u.prototype={push:function(t){this.vboxes.push({vbox:t,color:t.avg()})},palette:function(){return this.vboxes.map(function(t){return t.color})},size:function(){return this.vboxes.size()},map:function(t){for(var n=this.vboxes,r=0;r<n.size();r++)if(n.peek(r).vbox.contains(t))return n.peek(r).color;return this.nearest(t)},nearest:function(t){for(var n,r,o,e=this.vboxes,i=0;i<e.size();i++)((r=Math.sqrt(Math.pow(t[0]-e.peek(i).color[0],2)+Math.pow(t[1]-e.peek(i).color[1],2)+Math.pow(t[2]-e.peek(i).color[2],2)))<n||void 0===n)&&(n=r,o=e.peek(i).color);return o},forcebw:function(){var r=this.vboxes;r.sort(function(r,o){return t(n(r.color),n(o.color))});var o=r[0].color;o[0]<5&&o[1]<5&&o[2]<5&&(r[0].color=[0,0,0]);var e=r.length-1,i=r[e].color;i[0]>251&&i[1]>251&&i[2]>251&&(r[e].color=[255,255,255])}},{quantize:function(n,c){if(!Number.isInteger(c)||c<1||c>256)throw new Error("Invalid maximum color count. It must be an integer between 1 and 256.");if(!n.length||c<2||c>256)return!1;if(!n.length||c<2||c>256)return!1;for(var f=[],s=new Set,h=0;h<n.length;h++){var l=n[h],v=l.join(",");s.has(v)||(s.add(v),f.push(l))}if(f.length<=c)return new r(f);var g=function(t){var n,r=new Array(32768);return t.forEach(function(t){n=o(t[0]>>3,t[1]>>3,t[2]>>3),r[n]=(r[n]||0)+1}),r}(n);g.forEach(function(){});var p=function(t,n){var r,o,e,u=1e6,a=0,c=1e6,f=0,s=1e6,h=0;return t.forEach(function(t){(r=t[0]>>3)<u?u=r:r>a&&(a=r),(o=t[1]>>3)<c?c=o:o>f&&(f=o),(e=t[2]>>3)<s?s=e:e>h&&(h=e)}),new i(u,a,c,f,s,h,n)}(n,g),b=new e(function(n,r){return t(n.count(),r.count())});function d(t,n){for(var r,o=t.size(),e=0;e<1e3;){if(o>=n)return;if(e++>1e3)return;if((r=t.pop()).count()){var i=a(g,r),u=i[0],c=i[1];if(!u)return;t.push(u),c&&(t.push(c),o++)}else t.push(r),e++}}b.push(p),d(b,.75*c);for(var m=new e(function(n,r){return t(n.count()*n.volume(),r.count()*r.volume())});b.size();)m.push(b.pop());d(m,c);for(var w=new u;m.size();)w.push(m.pop());return w}}}().quantize,e=function(t){this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.width=this.canvas.width=t.naturalWidth,this.height=this.canvas.height=t.naturalHeight,this.context.drawImage(t,0,0,this.width,this.height)};e.prototype.getImageData=function(){return this.context.getImageData(0,0,this.width,this.height)};var u=function(){};return u.prototype.getColor=function(t,n){return void 0===n&&(n=10),this.getPalette(t,5,n)[0]},u.prototype.getPalette=function(t,n,r){var i=function(t){var n=t.colorCount,r=t.quality;if(void 0!==n&&Number.isInteger(n)){if(1===n)throw new Error("colorCount should be between 2 and 20. To get one color, call getColor() instead of getPalette()");n=Math.max(n,2),n=Math.min(n,20)}else n=10;return(void 0===r||!Number.isInteger(r)||r<1)&&(r=10),{colorCount:n,quality:r}}({colorCount:n,quality:r}),u=new e(t),a=function(t,n,r){for(var o,e,i,u,a,c=t,f=[],s=0;s<n;s+=r)e=c[0+(o=4*s)],i=c[o+1],u=c[o+2],(void 0===(a=c[o+3])||a>=125)&&(e>250&&i>250&&u>250||f.push([e,i,u]));return f}(u.getImageData().data,u.width*u.height,i.quality),c=o(a,i.colorCount);return c?c.palette():null},u.prototype.getColorFromUrl=function(t,n,r){var o=this,e=document.createElement("img");e.addEventListener("load",function(){var i=o.getPalette(e,5,r);n(i[0],t)}),e.src=t},u.prototype.getImageData=function(t,n){var r=new XMLHttpRequest;r.open("GET",t,!0),r.responseType="arraybuffer",r.onload=function(){if(200==this.status){var t=new Uint8Array(this.response);i=t.length;for(var r=new Array(i),o=0;o<t.length;o++)r[o]=String.fromCharCode(t[o]);var e=r.join(""),u=window.btoa(e);n("data:image/png;base64,"+u)}},r.send()},u.prototype.getColorAsync=function(t,n,r){var o=this;this.getImageData(t,function(t){var e=document.createElement("img");e.addEventListener("load",function(){var t=o.getPalette(e,5,r);n(t[0],this)}),e.src=t})},u});
    
    const colorThief = new ColorThief();
    const img = new Image();

    img.addEventListener('load', function() {
      const palette = colorThief.getPalette(img, 3)
      completion(palette);
    });

    img.crossOrigin = 'Anonymous';
    img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${randId}.png'
    `,
    true
  );
  const hexPalette = palette.map(rgbToHex);
  return { name: pokemonData.name, subtitle, palette: hexPalette, id: randId };
}

// Function to show a table that allows copying colours
async function showTable(data) {
  const table = new UITable();

  const titleRow = new UITableRow();
  titleRow.addImageAtURL(
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`
  );
  titleRow.addText(data.name.toUpperCase());
  table.addRow(titleRow);

  const messageRow = new UITableRow();
  const message = messageRow.addText(
    "Click a colour to copy it to your clipboard."
  );
  message.centerAligned();
  table.addRow(messageRow);

  for (const colour of data.palette) {
    const row = new UITableRow();
    row.backgroundColor = new Color(colour);
    const button = row.addButton(colour);
    button.centerAligned();

    button.onTap = () => {
      Pasteboard.copy(colour);
      const notify = new Notification();
      notify.title = "Colour Copied";
      notify.body = colour;
      notify.schedule();
    };
    table.addRow(row);
  }

  await table.present(false);
}

function randomInt(min, max) {
  // min and max are included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rgbToHex(rgbArr) {
  return (
    "#" +
    rgbArr
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// Get contrasting colour, see https://stackoverflow.com/a/41491220
function colourIsDark(bgColor) {
  let color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  let r = parseInt(color.substring(0, 2), 16); // hexToR
  let g = parseInt(color.substring(2, 4), 16); // hexToG
  let b = parseInt(color.substring(4, 6), 16); // hexToB
  let uicolors = [r / 255, g / 255, b / 255];
  let c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  let L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L <= 0.179;
}

// This is a minified version of HTML Widget (version 6.3.0) used to generate the widget.
// If you do not trust this, you can replace it with the full code here: https://github.com/Normal-Tangerine8609/Scriptable-HTML-Widget/blob/main/code/html-widget.js
async function htmlWidget(t,e=!1,a={}){let n="widget",i="",o={},s=-1,r=0;const l=new Map,c=["font","lineLimit","minimumScaleFactor","shadowColor","shadowOffset","shadowRadius","textColor","textOpacity","alignText"],{root:d,styleTags:p}=f(t),u=d.children.find((t=>"widget"==t.name));u||T("`widget` tag must be the root tag.");!function(t,e){!function t(e,a,n){const i={...n},o=[{selector:"*",css:i}],s=[];for(const t of a){t.partial||s.push(t);const[a,...n]=t.selector;if($(e,a))if(n.length)s.push({selector:n,css:t.css,partial:!0});else{for(const e in t.css)c.includes(e)&&(i[e]=t.css[e]);o.push(t)}}e.css=o;for(const a of e.children||[])t(a,s,i)}(t,e,{})}(u,function(t){const e=[],a=/([^{]+)\{([^}]+)\}/g;let n;for(;n=a.exec(t);){const t=n[1].trim(),a=n[2].trim().split(";").map((t=>t.trim())).filter((t=>t.length)).reduce(((t,e)=>{const[a,...n]=e.split(":"),i=A(a.trim()),o=n.join(":").trim();return t[i]="null"===o?null:o,t}),{});t.split(",").map((t=>t.trim())).forEach((t=>{e.push({selector:h(t),css:a})}))}return e}(p.map((t=>t.innerText)).join("\n")));const g={colour:{async add(t,e,a){const[n,i]=e.split("-").map((t=>t.trim()));let o;if(null!=i){const[t,e]=await Promise.all([k(n),k(i)]);o=`Color.dynamic(${t}, ${e})`}else o=await k(n);I(`${a}.${t} = ${o}`)},validate(){}},posInt:{add(t,e,a){I("refreshAfterDate"===t?`${a}.refreshAfterDate = new Date(Date.now() + ${e} * 60000)`:`${a}.${t} = ${e}`)},validate(t,e,a){/^\d+$/.test(a)||T("`{}` {} must be a positive integer: `{}`.",t,e,a)}},decimal:{add(t,e,a){let n=parseFloat(e.replace("%",""));e.endsWith("%")&&(n/=100),I(`${a}.${t} = ${n}`)},validate(t,e,a){const n=a.endsWith("%")?a.slice(0,-1):a,i=parseFloat(n);(!Number.isFinite(i)||i<0)&&T("`{}` {} must be a positive integer or float with an optional `%` at the end: `{}`.",t,e,a)}},gradient:{async add(t,e,a){s++;let n,i=e.split(/,(?![^(]*\))(?![^"']*["'](?:[^"']*["'][^"']*["'])*[^"']*$)/).map((t=>t.trim()));const o={"to top":0,"to top right":45,"to right":90,"to bottom right":135,"to bottom":180,"to bottom left":225,"to left":270,"to top left":315},r=i[0].toLowerCase();r in o?(i.shift(),n=o[r]):/\d+\s*deg/.test(r)?(i.shift(),n=Number(r.match(/(\d+)\s*deg/)[1])):n=0;const l=[],c=[];for(const t of i){const e=t.match(/\s+(\d+(?:\.\d+)?%?)$/);let a,n=null,i=t;if(e){const a=e[1];n=a.endsWith("%")?Number(a.slice(0,-1))/100:Number(a),i=t.slice(0,e.index).trim()}c.push(n);const[o,s]=i.split("-");if(null!=s){const[t,e]=await Promise.all([k(o),k(s)]);a=`Color.dynamic(${t}, ${e})`}else a=await k(o);l.push(a)}null===c[0]&&(c[0]=0),null===c.at(-1)&&(c[c.length-1]=1);for(let t=0;t<c.length;t++){let e=c[t],a=t+1;for(;a<c.length&&null===c[a];)a++;let n=(c[a]-c[t])/(a-t);for(let i=1;i<a-t;i++)c[t+i]=n*i+e}const d=Math.PI*(n-90)/180,p=Math.cos(d),u=Math.sin(d),g=.5/Math.max(Math.abs(p),Math.abs(u)),m=.5-g*p,f=.5-g*u,h=.5+g*p,$=.5+g*u;I(`let gradient${s} = new LinearGradient()`),I(`gradient${s}.colors = [${l}]`),I(`gradient${s}.locations = [${c}]`),I(`gradient${s}.startPoint = new Point(${m}, ${f})`),I(`gradient${s}.endPoint = new Point(${h}, ${$})`),I(`${a}.backgroundGradient = gradient${s}`)},validate(t,e,a){let n=a.split(/,(?![^(]*\))(?![^"']*["'](?:[^"']*["'][^"']*["'])*[^"']*$)/).map((t=>t.trim()));(["to top","to top right","to right","to bottom right","to bottom","to bottom left","to left","to top left"].includes(n[0].toLowerCase())||/\d+\s*deg/.test(n[0]))&&n.shift(),n.length<2&&T("`{}` {} must have at least two color stops after the direction: `{}`.",t,e,a);let i=-1/0;for(const o of n){const n=o.match(/\s+(\d+(?:\.\d+)?%?)$/);if(n){const o=n[1],s=o.endsWith("%")?Number(o.slice(0,-1))/100:Number(o);Number.isFinite(s)||T("`{}` {} has invalid position: `{}` in `{}`.",t,e,o,a),(s<0||s>1)&&T("`{}` {} position must be between `0` and `1`: `{}`.",t,e,o),s<i&&T("`{}` {} color-stop positions must be in ascending order: `{}`.",t,e,a),i=s}}}},padding:{add(t,e,a){if("default"===e)return void I(`${a}.useDefaultPadding()`);const n=e.split(",").map((t=>parseInt(t.trim(),10)));let[i,o,s,r]=n;1===n.length?[i,o,s,r]=[i,i,i,i]:2===n.length?[i,o,s,r]=[i,o,i,o]:3===n.length&&([i,o,s,r]=[i,o,s,o]),I(`${a}.setPadding(${i}, ${o}, ${s}, ${r})`)},validate(t,e,a){if("default"===a)return;const n=a.split(",").map((t=>t.trim()));(n.length<1||n.length>4)&&T("`{}` {} must have 1-4 comma-separated positive integers or be `default`: `{}`.",t,e,a);for(let i of n)/^\d+$/.test(i)||T("`{}` {} must be non-negative integers: `{}` contains `{}`.",t,e,a,i)}},size:{add(t,e,a){let[n,i]=e.split(",");I(`${a}.${t} = new Size(${n}, ${i})`)},validate(t,e,a){/^\d+\s*,\s*\d+$/.test(a)||T("`{}` {} must be 2 positive integers separated by commas: `{}`.",t,e,a)}},font:{add(t,e,a){let n=/^(((black|bold|medium|light|heavy|regular|semibold|thin|ultraLight)(MonospacedSystemFont|RoundedSystemFont|SystemFont)\s*,\s*(\d+))|(body|callout|caption1|caption2|footnote|subheadline|headline|largeTitle|title1|title2|title3)|((italicSystemFont)\s*,\s*(\d+)))$/;if(n.test(e))I(`${a}.font = Font.${e.replace(n,"$3$4$6$8($5$9)")}`);else{const[t,n]=e.split(",");I(`${a}.font = new Font("${t.replace(/"/g,"")}",${n.match(/\d+/g)[0]})`)}},validate(t,e,a){/^[^,]+,\s*\d+$/.test(a)||["body","callout","caption1","caption2","footnote","subheadline","headline","italicSystemFont","largeTitle","title1","title2","title3"].includes(a)||T("`{}` {} must be 1 font name and 1 positive integer separated by commas or be a content-based font: `{}`.",t,e,a)}},point:{add(t,e,a){const[n,i]=e.split(",");I(`${a}.shadowOffset = new Point(${n},${i})`)},validate(t,e,a){/^-?\d+\s*,\s*-?\d+$/.test(a)||T("`{}` {} must be 2 integers separated by commas: `{}`.",t,e,a)}},bool:{add(t,e,a){"false"!==e&&I("resizable"===t?`${a}.resizable = false`:`${a}.${t} = true`)},validate(){}},url:{add:(t,e,a)=>{I(`${a}.url = "${e.replace(/"/g,"")}"`)},validate(t,e,a){/^\w+:\/\/\S+$/.test(a)||T("`{}` {} must be a valid URL: `{}.`",t,e,a)}},image:{add(t,e,a){e.startsWith("data:image/")?I(`${a}.backgroundImage = Image.fromData(Data.fromBase64String("${e.split(",",2)[1].replace(/"/g,"")}"))`):I(`${a}.backgroundImage = await new Request("${e.replace(/"/g,"")}").loadImage()`)},validate(t,e,a){/^(https?:\/\/\S+|data:image\/\w+?;base64,[a-zA-Z0-9+/]+=*)$/.test(a)||T("`{}` {} must be a valid url or base encoded data link: `{}`.",t,e,a)}},layout:{add(t,e,a){I(`${a}.layout${x(e)}()`)},validate(t,e,a){"vertically"!==a&&"horizontally"!==a&&T("`{}` {} must be `vertically` or `horizontally`: `{}`.",t,e,a)}},alignText:{add(t,e,a){I(`${a}.${e}AlignText()`)},validate(t,e,a){["center","left","right"].includes(a)||T("`{}` {} must be `left`, `right` or `center`: `{}.`",t,e,a)}},alignImage:{add(t,e,a){I(`${a}.${e}AlignImage()`)},validate(t,e,a){["center","left","right"].includes(a)||T("`{}` {} must be `left`, `right` or `center`: `{}`.",t,e,a)}},alignContent:{add(t,e,a){I(`${a}.${e}AlignContent()`)},validate(t,e,a){["center","top","bottom"].includes(a)||T("`{}` {} must be `top`, `bottom` or `center`: `{}`.",t,e,a)}},applyStyle:{add(t,e,a){I(`${a}.apply${x(e)}Style()`)},validate(t,e,a){["date","timer","offset","relative","time"].includes(a)||T("`{}` {} must be `date`, `timer` , `relative`, `time`, or `offset`: `{}`.",t,e,a)}},contentMode:{add(t,e,a){I(`${a}.apply${x(e)}ContentMode()`)},validate(t,e,a){["filling","fitting"].includes(a)||T("`{}` {} must be `filling` or `fitting`: `{}`.",t,e,a)}}};await b(u),I("// Widget Complete"),e&&console.log(i);const m=new(0,Object.getPrototypeOf((async function(){})).constructor)(i+"\nreturn widget");return await m();function f(t){const e=[],a=new XMLParser(t),n={name:"root",children:[]},i=[n];return a.didStartElement=(t,a)=>{const n={name:t,attrs:a,innerText:"",children:[],classList:[],noCss:!1,putChildren:!1};"style"===t?e.push(n):i.at(-1).children.push(n),i.push(n)},a.foundCharacters=t=>{i.at(-1).innerText+=t},a.didEndElement=()=>{const t=i.pop(),e={};for(const[a,n]of Object.entries(t.attrs)){const i=A(a);if("class"===i)t.classList=t.attrs.class.trim().split(/\s+/);else if("noCss"===i)t.noCss=!0;else if("children"===i)t.putChildren=!0;else{const t=n.trim();e[i]="null"===t?null:t}}t.attrs=e,0===i.length&&T("Unexpected closing tag: <{}/>",t.name)},a.parseErrorOccurred=t=>{T("A parse error occurred: {}",t)},a.parse(),1!==i.length&&T("A parse error occurred, ensure all tags are closed and attributes are properly formatted: <{}>",i.at(-1).name),{root:n,styleTags:e}}function h(t){return t.replace(/\s/g,"").split(">").filter((t=>t.length)).map((t=>{let e,a=t;if(!t.startsWith(".")){const n=t.match(/^([a-zA-Z][\w-]*|\*)/);n?(e=n[1],a=t.slice(e.length)):T("A css parse error occurred, invalid tag name: {}.",t)}const n=[];let i;const o=/\.([-_a-zA-Z0-9]+)/g;for(;i=o.exec(a);)n.push(i[1]);return{tag:e,classes:n}}))}function $(t,{tag:e,classes:a}){return(!e||"*"===e||t.name===e)&&a.every((e=>t.classList.includes(e)))}async function b(t){"widget"==t.name&&i&&T("`widget` tag must not be nestled."),i&&I(""),t.name in o?o[t.name]+=1:o[t.name]=0;const e=o[t.name],s=t.innerText.replace(/&lt;/g,"<").replace(/&gt/g,">").replace(/&amp;/g,"&").replace(/\n\s+/g,"\\n"),l=function(t=[],e,a){if(a)return{...e};const n={};for(const{css:e}of t)Object.assign(n,e);return{...n,...e}}(t.css,t.attrs,t.noCss),c={widget:{mapping:{background:["gradient","image","colour"],refreshAfterDate:"posInt",spacing:"posInt",url:"url",padding:"padding",addAccessoryWidgetBackground:"bool"},hasChildren:!0,instantiate:()=>(I("let widget = new ListWidget()"),"widget"),async applyStyles(e){const{background:a,...n}=l,i=a in t.attrs?"attribute":"property";await w("widget",i,a),await y(e,n,this.mapping)}},stack:{mapping:{background:["gradient","image","colour"],spacing:"posInt",url:"url",padding:"padding",borderColor:"colour",borderWidth:"posInt",size:"size",cornerRadius:"posInt",alignContent:"alignContent",layout:"layout"},hasChildren:!0,instantiate:()=>(I(`let stack${e} = ${n}.addStack()`),`stack${e}`),async applyStyles(e){const{background:a,...n}=l,i=a in t.attrs?"attribute":"property";await w(e,i,a),await y(e,n,this.mapping)}},spacer:{mapping:{space:"posInt"},hasChildren:!1,instantiate(){const a=t.attrs.space??"";return I(`let spacer${e} = ${n}.addSpacer(${a})`),null}},text:{mapping:{url:"url",font:"font",lineLimit:"posInt",minimumScaleFactor:"decimal",shadowColor:"colour",shadowOffset:"point",shadowRadius:"posInt",textColor:"colour",textOpacity:"decimal",alignText:"alignText"},hasChildren:!1,instantiate:()=>(I(`let text${e} = ${n}.addText("${s.replace(/"/g,"")}")`),`text${e}`),async applyStyles(t){await y(t,l,this.mapping)}},date:{mapping:{url:"url",font:"font",lineLimit:"posInt",minimumScaleFactor:"decimal",shadowColor:"colour",shadowOffset:"point",shadowRadius:"posInt",textColor:"colour",textOpacity:"decimal",alignText:"alignText",applyStyle:"applyStyle"},hasChildren:!1,instantiate:()=>(I(`let date${e} = ${n}.addDate(new Date("${s.replace(/"/g,"")}"))`),`date${e}`),async applyStyles(t){await y(t,l,this.mapping)}},img:{mapping:{src:"image",url:"url",borderColor:"colour",borderWidth:"posInt",cornerRadius:"posInt",imageSize:"size",imageOpacity:"decimal",tintColor:"colour",resizable:"bool",containerRelativeShape:"bool",contentMode:"contentMode",alignImage:"alignImage"},hasChildren:!1,instantiate(){let a;return t.attrs.src||T("`img` tag must have a `src` attribute."),a=t.attrs.src.startsWith("data:image/")?`Image.fromData(Data.fromBase64String("${t.attrs.src.replace(/data:image\/.*?;base64,/,"").replace(/"/g,"")}"))`:`await new Request("${t.attrs.src.replace(/"/g,"")}").loadImage()`,I(`let img${e} = ${n}.addImage(${a})`),`img${e}`},async applyStyles(t){const{src:e,...a}=l;await y(t,a,this.mapping)}}},d=c[t.name];if(!d){t.name in a||T("Invalid tag name: `{}`.",t.name),I(`// <${t.name}>`);const e=a[t.name],i=e.mapping||{};C(t.attrs,l,i);for(let e in i)e in l||(l[e]=null),e in t.attrs||(t.attrs[e]=null);const o=e=>async function(t,e){let{root:a}=f(t);a.children.forEach((t=>v(t,e))),r++;const i=n;for(let t of a.children)n=i,await b(t);r--}(e,t.children);return await e.render(o,l,t.attrs,s),void I(`// </${t.name}>`)}const p=d.instantiate();if(C(t.attrs,l,d.mapping),await(d.applyStyles?.(p)),d.hasChildren){r++;const e=n;n=p;for(const e of t.children)await b(e);r--,n=e}}async function y(t,e,a){for(const[n,i]of Object.entries(e)){if(null===i)continue;const e=a[n];await g[e].add(n,i,t)}}async function w(t,e,a){if(a)try{g.url.validate("background","attribute",a),g.image.add("background",a,t)}catch{1===a.split(/,(?![^(]*\))(?![^"']*["'](?:[^"']*["'][^"']*["'])*[^"']*$)/).length?await g.colour.add("backgroundColor",a,t):(g.gradient.validate("backgroundGradient",e,a),await g.gradient.add("backgroundGradient",a,t))}}function v(t,e){t.noCss=!0;for(let a of t.children||[])v(a,e);t.putChildren&&t.children.push(...e)}function C(t,e,a){S(t,a,"attribute"),S(e,a,"property")}function S(t,e,a){for(const[n,i]of Object.entries(t)){const o=e[n];if(!o){if("property"===a){delete t[n];continue}T("Unknown attribute: `{}`.",n)}if(null===i)continue;if(!Array.isArray(o)){g[o].validate(n,a,i);continue}if(!o.some((t=>{try{return g[t].validate(n,a,i),!0}catch{return!1}}))){const t=o.join(", ").replace(/,([^,]+)$/," or$1");T("`{}` {} must be {} type: `{}`",n,a,t,i)}}}function I(t){const e=" ".repeat(r);i+=`\n${e+t}`}function x(t){return t[0].toUpperCase()+t.slice(1)}async function k(t){if(l.has(t))return l.get(t);if(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(t))return`new Color("${t}")`;let e=new WebView;await e.loadHTML(`<div id="div"style="color:${t}"></div>`);const a=function(t,e,a,n=1){const i=t=>t.toString(16).padStart(2,"0"),o=1===n?"":`,${n}`;return`new Color("#${i(t)}${i(e)}${i(a)}"${o})`}(...(await e.evaluateJavaScript('window.getComputedStyle(document.getElementById("div")).color')).match(/\d+(\.\d+)?/g).map(Number));return l.set(t,a),a}function A(t){return t.replace(/-(.)/g,((t,e)=>e.toUpperCase()))}function T(t,...e){for(let a of e)t=t.replace("{}",a);throw new Error(`HTML Widget Error\n--------<Code>--------\n${i}\n--------</Code>--------\n${t}`)}}module.exports=htmlWidget;