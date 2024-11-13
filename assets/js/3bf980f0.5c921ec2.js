"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[893],{5680:(e,t,n)=>{n.d(t,{xA:()=>g,yg:()=>y});var r=n(6540);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),s=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},g=function(e){var t=s(e.components);return r.createElement(p.Provider,{value:t},e.children)},d="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,g=l(e,["components","mdxType","originalType","parentName"]),d=s(n),u=a,y=d["".concat(p,".").concat(u)]||d[u]||c[u]||o;return n?r.createElement(y,i(i({ref:t},g),{},{components:n})):r.createElement(y,i({ref:t},g))}));function y(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=u;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[d]="string"==typeof e?e:a,i[1]=l;for(var s=2;s<o;s++)i[s]=n[s];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},486:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>c,frontMatter:()=>o,metadata:()=>l,toc:()=>s});var r=n(8168),a=(n(6540),n(5680));const o={sidebar_position:2},i="Command line options",l={unversionedId:"introduction/command-line-options",id:"introduction/command-line-options",title:"Command line options",description:"When using SCI by running npx setup-ci, you can provide additional option flags to modify the default behavior.",source:"@site/docs/introduction/command-line-options.mdx",sourceDirName:"introduction",slug:"/introduction/command-line-options",permalink:"/setup-ci/docs/introduction/command-line-options",draft:!1,tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"tutorialSidebar",previous:{title:"Getting started",permalink:"/setup-ci/docs/introduction/getting-started"},next:{title:"Package Managers",permalink:"/setup-ci/docs/introduction/package-managers"}},p={},s=[{value:"General options",id:"general-options",level:2},{value:"Feature flags",id:"feature-flags",level:2}],g={toc:s},d="wrapper";function c(e){let{components:t,...n}=e;return(0,a.yg)(d,(0,r.A)({},g,n,{components:t,mdxType:"MDXLayout"}),(0,a.yg)("h1",{id:"command-line-options"},"Command line options"),(0,a.yg)("p",null,"When using SCI by running ",(0,a.yg)("inlineCode",{parentName:"p"},"npx setup-ci"),", you can provide additional option flags to modify the default behavior."),(0,a.yg)("h2",{id:"general-options"},"General options"),(0,a.yg)("table",null,(0,a.yg)("thead",{parentName:"table"},(0,a.yg)("tr",{parentName:"thead"},(0,a.yg)("th",{parentName:"tr",align:null},"Flag"),(0,a.yg)("th",{parentName:"tr",align:null},"Description"))),(0,a.yg)("tbody",{parentName:"table"},(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"--preset"),(0,a.yg)("td",{parentName:"tr",align:null},"Run the script with your own preset to skip interactive survey at the beginning. Combine it with feature flags to specify what workflows you want to generate.")),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"--skip-git-check"),(0,a.yg)("td",{parentName:"tr",align:null},"By default, the script will prompt the user if there are uncommitted changes in the working repository. Use this flag to proceed without asking.")),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"--version"),(0,a.yg)("td",{parentName:"tr",align:null},"Print version and exit")),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"--help"),(0,a.yg)("td",{parentName:"tr",align:null},"Print help message and exit")))),(0,a.yg)("h2",{id:"feature-flags"},"Feature flags"),(0,a.yg)("p",null,"The following are ",(0,a.yg)("strong",{parentName:"p"},"feature flags")," that can be used with ",(0,a.yg)("inlineCode",{parentName:"p"},"--preset")," flag (they are ignored if ",(0,a.yg)("inlineCode",{parentName:"p"},"--preset")," is not provided)."),(0,a.yg)("table",null,(0,a.yg)("thead",{parentName:"table"},(0,a.yg)("tr",{parentName:"thead"},(0,a.yg)("th",{parentName:"tr",align:null},"Flag"),(0,a.yg)("th",{parentName:"tr",align:null},"Description"))),(0,a.yg)("tbody",{parentName:"table"},(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"--lint"),(0,a.yg)("td",{parentName:"tr",align:null},"Generate ",(0,a.yg)("a",{parentName:"td",href:"/setup-ci/docs/workflows/eslint"},"ESLint workflow"))),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"--jest"),(0,a.yg)("td",{parentName:"tr",align:null},"Generate ",(0,a.yg)("a",{parentName:"td",href:"/setup-ci/docs/workflows/jest"},"Jest workflow"))),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"--ts"),(0,a.yg)("td",{parentName:"tr",align:null},"Generate ",(0,a.yg)("a",{parentName:"td",href:"/setup-ci/docs/workflows/typescript"},"Typescript check workflow"))),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"--prettier"),(0,a.yg)("td",{parentName:"tr",align:null},"Generate ",(0,a.yg)("a",{parentName:"td",href:"/setup-ci/docs/workflows/prettier"},"Prettier check workflow"))),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"--eas"),(0,a.yg)("td",{parentName:"tr",align:null},"Generate ",(0,a.yg)("a",{parentName:"td",href:"/setup-ci/docs/workflows/detox"},"Detox workflow"))),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"--detox"),(0,a.yg)("td",{parentName:"tr",align:null},"Generate ",(0,a.yg)("a",{parentName:"td",href:"/setup-ci/docs/workflows/maestro"},"Maestro workflow"))),(0,a.yg)("tr",{parentName:"tbody"},(0,a.yg)("td",{parentName:"tr",align:null},"--maestro"),(0,a.yg)("td",{parentName:"tr",align:null},"Generate ",(0,a.yg)("a",{parentName:"td",href:"/setup-ci/docs/workflows/eas"},"EAS Preview workflow"))))))}c.isMDXComponent=!0}}]);