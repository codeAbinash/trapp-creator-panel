import axios, { AxiosResponse } from 'axios'
import ls from './ls'

class Chunk {
  name: string
  size: number
  url: string
  totalNumber: number = 0
  start: number = 0
  file: File = {} as File
  thumbnail: File = {} as File
  cat_id: string = ''
  identity: string = this.generateRandomString()
  title: string = ''
  description: string = ''
  privacy: string = 'public'
  codes: number[] = [400, 404, 415, 500, 501]
  successFn: () => void = () => {}
  errorFn: () => void = () => {}
  updateProgressFn: (progress: number) => void = () => {}

  constructor(props: {
    name: string
    title: string
    description: string
    privacy: string
    size: number
    url: string
    cat_id: string
    successFn: () => void
    errorFn: () => void
    updateProgressFn: (progress: number) => void
  }) {
    this.name = props.name
    this.size = props.size
    this.url = props.url
    this.title = props.title
    this.description = props.description
    this.privacy = props.privacy
    this.cat_id = props.cat_id
    this.successFn = props.successFn
    this.errorFn = props.errorFn
    this.updateProgressFn = props.updateProgressFn
  }

  setFile(file: File) {
    this.file = file
    this.setTotalNumber()
  }

  setThumbnail(thumbnail: File) {
    this.thumbnail = thumbnail
  }

  setTotalNumber() {
    const total = Math.ceil(this.file.size / this.size)

    this.totalNumber = total > 0 ? total : 1
  }

  getNumber() {
    return this.start / this.size + 1
  }

  generateRandomString(length: number = 32): string {
    return [...Array(length)].map(() => (~~(Math.random() * 36)).toString(36)).join('')
  }

  slice(start: number, end: number): Blob {
    return this.file.slice(start, end - 1)
  }

  commit() {
    this.push(this.start, this.start + this.size + 1)
  }

  push(start: number, end: number) {
    const data = new FormData()
    data.append(this.name, this.slice(start, end))
    // If it is the last chunk, then append the other form data
    if (this.getNumber() === this.totalNumber) {
      data.append('thumbnail', this.thumbnail)
      data.append('title', this.title)
      data.append('description', this.description)
      data.append('privacy', this.privacy)
      data.append('cat_id', this.cat_id)
    }
    axios
      .post(this.url, data, {
        headers: {
          'x-chunk-number': this.getNumber(),
          'x-chunk-total-number': this.totalNumber,
          'x-chunk-size': this.size,
          'x-file-name': this.file.name,
          'x-file-size': this.file.size,
          'x-file-identity': this.identity,
          Authorization: `Bearer ${ls.get('token')}`,
          // ...authorizedHeader(defaultHeaders),
        },
      })
      .then((response: AxiosResponse) => {
        this.start += this.size

        switch (response.status) {
          // done
          case 200:
            // console.log(response.data)
            this.successFn()
            break

          // asking for the next chunk...
          case 201:
            this.updateProgressFn(response.data.progress)
            console.log(`${response.data.progress}% uploaded...`)
            if (this.start < this.file.size) {
              this.commit()
            }
            break
        }
      })
      .catch((error) => {
        if (error.response) {
          if (this.codes.includes(error.response.status)) {
            console.warn(error.response.status, 'Failed to upload the chunk.')
          } else if (error.response.status === 422) {
            console.warn('Validation Error', error.response.data)
          } else {
            console.log('Re-uploading the chunk...')
            this.commit()
          }
        } else {
          console.log('Re-uploading the chunk...')
          this.commit()
        }

        this.errorFn()
      })
  }
}

export default Chunk
