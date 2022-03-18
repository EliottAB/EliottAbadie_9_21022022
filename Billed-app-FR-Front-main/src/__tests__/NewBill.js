/**
 * @jest-environment jsdom
 */

import { getByLabelText, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH} from "../constants/routes.js";
import { bills } from "../fixtures/bills.js"
import router from "../app/Router.js";
import {fireEvent} from "@testing-library/dom"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then inputs should be here", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newbill = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      expect(screen.getAllByTestId("expense-type")[0]).toBeTruthy()
    })
    describe("when i give a file", () => {
      test("Then it should get the file datas", () =>{
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const newbill = new NewBill({
          document, onNavigate, store: null, localStorage: window.localStorage
        })
        const file = screen.getAllByTestId("file")[0]
        const filedata = {
          file: "image.png",
        }; 

        function changefile(e) {
          jest.fn(()=> newbill.handleChangeFile(e))
          console.log("ok")
        }
        file.addEventListener("change", changefile(this))
        fireEvent.change(file, {target: { files: [new File(["image"], filedata.file, {type: "image/png"})]}});
      })
    })
  })
})
