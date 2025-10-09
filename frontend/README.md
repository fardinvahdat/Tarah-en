
# 📖 Project structure
```
├── app // static resources
│ ├── fabricCanvas // FabricCanvas
│ ├── fabricControls // selector
│ ├── fabricRuler // ruler
│ ├── fabricTool // drag
│ ├── guideLines // auxiliary lines
│ ├── hoverBorders // pre-selection
│ └── wheelScroll // zoom
├── assets // static resources
│ ├── fonts // online font files
│ └── styles // styles
├── components // general components not related to business logic
├── configs // configuration files, such as: color, font.
├── hooks // hooks methods for multiple components (modules)
├── extension // custom fabric objects
│ ├── controls // crop image controls
│ ├── mixins // crop image mixins
│ └── object // custom element object
├── mocks // mocks data
├── plugins // custom Vue plugins
├── types // type definition files
├── store // Pinia store, reference: https://pinia.vuejs.org/
├── utils // general tool methods
├── views // business component directory.
│ ├── Canvas // editor object
│ └── Editor // editor module
└── worker // web worker
```