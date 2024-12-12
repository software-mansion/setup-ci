"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[348],{5680:(e,t,r)=>{r.d(t,{xA:()=>u,yg:()=>g});var o=r(6540);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,o,n=function(e,t){if(null==e)return{};var r,o,n={},a=Object.keys(e);for(o=0;o<a.length;o++)r=a[o],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)r=a[o],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var s=o.createContext({}),d=function(e){var t=o.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},u=function(e){var t=d(e.components);return o.createElement(s.Provider,{value:t},e.children)},c="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},f=o.forwardRef((function(e,t){var r=e.components,n=e.mdxType,a=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),c=d(r),f=n,g=c["".concat(s,".").concat(f)]||c[f]||p[f]||a;return r?o.createElement(g,i(i({ref:t},u),{},{components:r})):o.createElement(g,i({ref:t},u))}));function g(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var a=r.length,i=new Array(a);i[0]=f;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[c]="string"==typeof e?e:n,i[1]=l;for(var d=2;d<a;d++)i[d]=r[d];return o.createElement.apply(null,i)}return o.createElement.apply(null,r)}f.displayName="MDXCreateElement"},4658:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>p,frontMatter:()=>a,metadata:()=>l,toc:()=>d});var o=r(8168),n=(r(6540),r(5680));const a={sidebar_position:6},i="Maestro",l={unversionedId:"workflows/maestro",id:"workflows/maestro",title:"Maestro",description:"Set up workflow to run Maestro E2E tests for every Pull Request.",source:"@site/docs/workflows/maestro.mdx",sourceDirName:"workflows",slug:"/workflows/maestro",permalink:"/setup-ci/docs/workflows/maestro",draft:!1,tags:[],version:"current",sidebarPosition:6,frontMatter:{sidebar_position:6},sidebar:"tutorialSidebar",previous:{title:"Detox",permalink:"/setup-ci/docs/workflows/detox"},next:{title:"EAS Preview",permalink:"/setup-ci/docs/workflows/eas"}},s={},d=[{value:"Usage",id:"usage",level:2},{value:"Detailed behavior",id:"detailed-behavior",level:2},{value:"Installed dependencies",id:"installed-dependencies",level:3},{value:"Debug build workflow",id:"debug-build-workflow",level:3},{value:"Modified and created files",id:"modified-and-created-files",level:3},{value:"Workflow details",id:"workflow-details",level:3},{value:"maestro-test-android",id:"maestro-test-android",level:4},{value:"maestro-test-ios",id:"maestro-test-ios",level:4},{value:"Known issues and limitations",id:"known-issues-and-limitations",level:2}],u={toc:d},c="wrapper";function p(e){let{components:t,...r}=e;return(0,n.yg)(c,(0,o.A)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,n.yg)("h1",{id:"maestro"},"Maestro"),(0,n.yg)("p",null,"Set up workflow to run Maestro E2E tests for every Pull Request."),(0,n.yg)("p",null,"Learn more about Maestro: ",(0,n.yg)("a",{parentName:"p",href:"https://maestro.mobile.dev/"},"maestro.mobile.dev")),(0,n.yg)("h2",{id:"usage"},"Usage"),(0,n.yg)("pre",null,(0,n.yg)("code",{parentName:"pre",className:"language-bash"},"npx setup-ci --preset --maestro\n")),(0,n.yg)("h2",{id:"detailed-behavior"},"Detailed behavior"),(0,n.yg)("p",null,"Below you can find detailed information about what the script does with your project when generating Maestro workflow."),(0,n.yg)("h3",{id:"installed-dependencies"},"Installed dependencies"),(0,n.yg)("p",null,"Since Maestro is a CLI tool, it requires no additional dependencies to be installed!"),(0,n.yg)("h3",{id:"debug-build-workflow"},"Debug build workflow"),(0,n.yg)("p",null,"To test the app with Maestro, we need to first build the app in debug mode. Therefore, apart from\nCI workflow to run Maestro tests, SCI will generate workflows for building the app, on which the Maestro\nworkflow depends. You can read more about the debug build workflow in ",(0,n.yg)("a",{parentName:"p",href:"/docs/aux-workflows/build-debug"},"Debug build"),"."),(0,n.yg)("h3",{id:"modified-and-created-files"},"Modified and created files"),(0,n.yg)("table",null,(0,n.yg)("tr",null,(0,n.yg)("th",{style:{width:"40%"}},"File"),(0,n.yg)("th",null,"Changes")),(0,n.yg)("tr",null,(0,n.yg)("td",null,(0,n.yg)("code",null,".github/workflows/maestro-test-android.yml")),(0,n.yg)("td",null,"Contains the CI workflow for Maestro on Android")),(0,n.yg)("tr",null,(0,n.yg)("td",null,(0,n.yg)("code",null,".github/workflows/maestro-test-ios.yml")),(0,n.yg)("td",null,"Contains the CI workflow for Maestro on iOS")),(0,n.yg)("tr",null,(0,n.yg)("td",null,(0,n.yg)("code",null,"package.json")),(0,n.yg)("td",null,"New script: ",(0,n.yg)("code",null,"maestro:test: maestro test --debug-output maestro-debug-output .maestro"))),(0,n.yg)("tr",null,(0,n.yg)("td",null,(0,n.yg)("code",null,".maestro/example-flow.yml")),(0,n.yg)("td",null,"Example Maestro test, created if no ",(0,n.yg)("code",null,".maestro")," directory is detected"))),(0,n.yg)("h3",{id:"workflow-details"},"Workflow details"),(0,n.yg)("h4",{id:"maestro-test-android"},"maestro-test-android"),(0,n.yg)("p",null,"The following diagram represents the flow of ",(0,n.yg)("inlineCode",{parentName:"p"},"maestro-test-android")," workflow:"),(0,n.yg)("mermaid",{value:'flowchart TD;\n    A["\u231b Wait for debug build to finish\\nUsing <a href=\'/setup-ci/docs/aux-workflows/build-debug\'>build-debug</a>"]--\x3eB["\ud83d\udc1b Restore debug build from cache"];\n    B--\x3eC["\ud83c\udf3f Setup Node"];\n    C--\x3eD["\u2615 Setup JDK 17"]\n    D--\x3eE["\ud83d\udc18 Setup Gradle 8.8"]\n    E--\x3eF["\ud83d\udce6 Install dependencies"];\n    F--\x3eG["\ud83c\udfce\ufe0f Enable KVM\\n<a href=\'https://github.com/ReactiveCircus/android-emulator-runner?tab=readme-ov-file#running-hardware-accelerated-emulators-on-linux-runners\'>Learn more</a>"]\n    G--\x3eH["\ud83d\udcf1 AVD cache\\n<a href=\'https://github.com/ReactiveCircus/android-emulator-runner?tab=readme-ov-file#usage--examples\'>Learn more</a>"]\n    H--\x3eI["\ud83d\ude87 Run Metro bundler in the background [yarn start]\\n(Must be run since we test on debug build)"]\n    I--\x3eJ["\ud83e\uddea Run Maestro tests [yarn maestro:test]\\nUsing <a href=\'https://github.com/ReactiveCircus/android-emulator-runner\'>Android Emulator Runner</a>"]\n    J--\x3eK["\ud83d\udce4 Store debug output if failed\\nUsing <a href=\'https://github.com/actions/upload-artifact\'>actions/upload-artifact</a>"]'}),(0,n.yg)("h4",{id:"maestro-test-ios"},"maestro-test-ios"),(0,n.yg)("p",null,"The following diagram represents the flow of ",(0,n.yg)("inlineCode",{parentName:"p"},"maestro-test-ios")," workflow:"),(0,n.yg)("mermaid",{value:'flowchart TD;\n    A["\u231b Wait for debug build to finish\\nUsing <a href=\'/setup-ci/docs/aux-workflows/build-debug\'>build-debug</a>"]--\x3eB["\ud83d\udc1b Restore debug build from cache"];\n    B--\x3eC["\ud83c\udf3f Setup Node"];\n    C--\x3eD["\u2615 Setup JDK 17\\n(Java is a dependency of Maestro)"]\n    D--\x3eE["\ud83d\udce6 Install dependencies"];\n    E--\x3eF["\ud83d\udcf1 Boot iOS simulator"]\n    F--\x3eG["\ud83d\ude87 Run Metro bundler in the background [yarn start]\\n(Must be run since we test on debug build)"]\n    G--\x3eH["\ud83e\uddea Run Maestro tests [yarn maestro:test]"]\n    H--\x3eI["\ud83d\udce4 Store debug output if failed\\nUsing <a href=\'https://github.com/actions/upload-artifact\'>actions/upload-artifact</a>"]'}),(0,n.yg)("h2",{id:"known-issues-and-limitations"},"Known issues and limitations"),(0,n.yg)("ul",null,(0,n.yg)("li",{parentName:"ul"},"Maestro drives sometimes fails to start on ",(0,n.yg)("inlineCode",{parentName:"li"},"macos")," GitHub Actions runners. This is a known open issue,\nyou can follow it here: ",(0,n.yg)("a",{parentName:"li",href:"https://github.com/mobile-dev-inc/maestro/issues/1585"},"#1585"))))}p.isMDXComponent=!0}}]);