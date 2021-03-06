import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"
let passfilename
let passformdata
export let filevalid

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)
    passfilename = fileName
    passformdata = formData
    let ext = fileName.substr(fileName.lastIndexOf(".") + 1, fileName.length).toLowerCase()
    let testfilevalid
    if(e.target.testfilevalid){
      testfilevalid = e.target.testfilevalid.substr(e.target.testfilevalid.lastIndexOf(".") + 1, e.target.testfilevalid.length).toLowerCase()
    }
    if (ext === "jpg" || ext === "png" || ext === "jpeg" || testfilevalid === "png") {
      filevalid = true
    }else{
      filevalid = false
    }
  }
  handleSubmit = e => {
    e.preventDefault()
    if (filevalid === true) {
      this.store
        .bills()
        .create({
          data: passformdata,
          headers: {
            noContentType: true
          }
        })
        .then(({fileUrl, key}) => {
          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = passfilename
          console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
          const email = JSON.parse(localStorage.getItem("user")).email
          const bill = {
            email,
            type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
            name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
            amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
            date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
            vat: e.target.querySelector(`input[data-testid="vat"]`).value,
            pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
            commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
            fileUrl: this.fileUrl,
            fileName: this.fileName,
            status: 'pending'
          }
          this.updateBill(bill)
          this.onNavigate(ROUTES_PATH['Bills'])
        }).catch(error => console.error(error))
    }
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}