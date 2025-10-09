import { defineStore } from 'pinia'
interface menuOption{
    icon: string,
    title: string,
    width:number,
    height:number,
}
interface Menu {
    [index: number]: menuOption;
}
interface StoreState{
    menuOptions:Menu
}
export const useCreateDesignStore = defineStore('create-design', {
  state: (): StoreState => ({
    menuOptions:[
    {
        icon: 'create-design-instagram',
        title: "Instagram post (4: 5)",
        width:1080,
        height:1380,
        color:"#ff3b4b"
    },
    {
        icon: 'create-design-instagram',
        title: "Instagram post (square)",
        width:1080,
        height:1080,
        color:"#ff3b4b"
    },
    {
        icon: 'create-design-logo',
        title: "People",
        width:500,
        height:500,
        color:"#6453d0"
    },
    {
        icon: 'create-design-wallpaper',
        title: "Wallpaper",
        width:1080,
        height:1920,
        color:"#6453d0"
    },
    {
        icon: 'create-design-instagram',
        title: "Instagram Story",
        width:1080,
        height:1920,
        color:'#e950f7'
    },
  ]
  }),
})