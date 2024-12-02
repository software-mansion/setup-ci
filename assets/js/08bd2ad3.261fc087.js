"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[781],{5680:(e,n,t)=>{t.d(n,{xA:()=>c,yg:()=>m});var o=t(6540);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,o,r=function(e,n){if(null==e)return{};var t,o,r={},i=Object.keys(e);for(o=0;o<i.length;o++)t=i[o],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)t=i[o],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var s=o.createContext({}),p=function(e){var n=o.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},c=function(e){var n=p(e.components);return o.createElement(s.Provider,{value:n},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var n=e.children;return o.createElement(o.Fragment,{},n)}},g=o.forwardRef((function(e,n){var t=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=p(t),g=r,m=u["".concat(s,".").concat(g)]||u[g]||d[g]||i;return t?o.createElement(m,a(a({ref:n},c),{},{components:t})):o.createElement(m,a({ref:n},c))}));function m(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var i=t.length,a=new Array(i);a[0]=g;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l[u]="string"==typeof e?e:r,a[1]=l;for(var p=2;p<i;p++)a[p]=t[p];return o.createElement.apply(null,a)}return o.createElement.apply(null,t)}g.displayName="MDXCreateElement"},4518:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>a,default:()=>d,frontMatter:()=>i,metadata:()=>l,toc:()=>p});var o=t(8168),r=(t(6540),t(5680));const i={sidebar_position:4},a="Node/Bun version",l={unversionedId:"introduction/node-bun-version",id:"introduction/node-bun-version",title:"Node/Bun version",description:"To make all workflows generated by SCI as consistent as possible, each of them has a step",source:"@site/docs/introduction/node-bun-version.mdx",sourceDirName:"introduction",slug:"/introduction/node-bun-version",permalink:"/setup-ci/docs/introduction/node-bun-version",draft:!1,tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"tutorialSidebar",previous:{title:"Package Managers",permalink:"/setup-ci/docs/introduction/package-managers"},next:{title:"Support for monorepos",permalink:"/setup-ci/docs/introduction/monorepos"}},s={},p=[{value:"Caching global package manager data",id:"caching-global-package-manager-data",level:2},{value:"Node version file",id:"node-version-file",level:2},{value:"Bun version file",id:"bun-version-file",level:2}],c={toc:p},u="wrapper";function d(e){let{components:n,...t}=e;return(0,r.yg)(u,(0,o.A)({},c,t,{components:n,mdxType:"MDXLayout"}),(0,r.yg)("h1",{id:"nodebun-version"},"Node/Bun version"),(0,r.yg)("p",null,"To make all workflows generated by SCI as consistent as possible, each of them has a step\nwhere specific version of node or bun is set. It should look more or less like this:"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-yaml"},'- name: \ud83c\udf3f Setup Node\n  uses: actions/setup-node@v4\n  with:\n    node-version-file: ".nvmrc"\n    cache: "yarn"\n')),(0,r.yg)("p",null,"in case your package manager is ",(0,r.yg)("inlineCode",{parentName:"p"},"npm"),", ",(0,r.yg)("inlineCode",{parentName:"p"},"yarn")," or ",(0,r.yg)("inlineCode",{parentName:"p"},"pnpm"),", and like this:"),(0,r.yg)("pre",null,(0,r.yg)("code",{parentName:"pre",className:"language-yaml"},'- name: \ud83e\udd5f Setup Bun\n  uses: oven-sh/setup-bun@v2\n  with:\n    bun-version-file: ".bun-version" : \n')),(0,r.yg)("p",null,"if your project uses ",(0,r.yg)("inlineCode",{parentName:"p"},"bun"),"."),(0,r.yg)("p",null,"For more information, check ",(0,r.yg)("a",{parentName:"p",href:"https://github.com/actions/setup-node"},"actions/setup-node"),"\nand ",(0,r.yg)("a",{parentName:"p",href:"https://github.com/oven-sh/setup-bun"},"actions/setup-bun"),"."),(0,r.yg)("h2",{id:"caching-global-package-manager-data"},"Caching global package manager data"),(0,r.yg)("p",null,"Note the field ",(0,r.yg)("inlineCode",{parentName:"p"},"cache")," in setup step. It is set to your package manager to enable caching of global packages data."),(0,r.yg)("admonition",{type:"caution"},(0,r.yg)("p",{parentName:"admonition"},(0,r.yg)("inlineCode",{parentName:"p"},"node_modules")," is not cached. ")),(0,r.yg)("h2",{id:"node-version-file"},"Node version file"),(0,r.yg)("p",null,"The ",(0,r.yg)("inlineCode",{parentName:"p"},"node-version-file")," field will be set to point to a file in your repository from which\nnode version should be retrieved. Possible values are:"),(0,r.yg)("ul",null,(0,r.yg)("li",{parentName:"ul"},(0,r.yg)("inlineCode",{parentName:"li"},".nvmrc")," if exists,"),(0,r.yg)("li",{parentName:"ul"},(0,r.yg)("inlineCode",{parentName:"li"},".node-version")," if exists,"),(0,r.yg)("li",{parentName:"ul"},(0,r.yg)("inlineCode",{parentName:"li"},"package.json"),", if either ",(0,r.yg)("inlineCode",{parentName:"li"},"engines.node")," or ",(0,r.yg)("inlineCode",{parentName:"li"},"volta.node")," fields are specified.")),(0,r.yg)("p",null,"If SCI fails to detect files satisfying these conditions, it will create ",(0,r.yg)("inlineCode",{parentName:"p"},".nvmrc")," file in your project with\ndefault node version."),(0,r.yg)("p",null,"Also, the workflow step will have the field ",(0,r.yg)("inlineCode",{parentName:"p"},"cache")," set to your package manager to enable global packages data caching."),(0,r.yg)("h2",{id:"bun-version-file"},"Bun version file"),(0,r.yg)("p",null,"Similarly to how SCI detects node version and creates ",(0,r.yg)("inlineCode",{parentName:"p"},".nvmrc")," file in case of failure, if your\nprojects uses ",(0,r.yg)("inlineCode",{parentName:"p"},"bun")," and SCI fails to detect ",(0,r.yg)("inlineCode",{parentName:"p"},".bun-version")," file, it will create it with default bun version,\nwhich will be provided in generated workflows in the ",(0,r.yg)("inlineCode",{parentName:"p"},"bun-version-file")," field."))}d.isMDXComponent=!0}}]);