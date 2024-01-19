// LocalStorage related functions
export const ls = {
  get: (item: string) => {
    return localStorage.getItem(item)
  },
  set: (item: string, data: string) => {
    return localStorage.setItem(item, data)
  },
  clear: () => {
    localStorage.clear()
  },
  getJsonFn: (item: string) => {
    return function () {
      return JSON.parse(ls.get(item) || '{}')
    }
  },
}
export default ls
