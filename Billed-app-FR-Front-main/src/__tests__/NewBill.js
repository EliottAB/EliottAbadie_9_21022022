/**
 * @jest-environment jsdom
 */

import { getByLabelText, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH} from "../constants/routes.js";
import { ROUTES } from "../constants/routes.js";
import { bills } from "../fixtures/bills.js"
import router from "../app/Router.js";
import {fireEvent} from "@testing-library/dom"
import {filevalid} from "../containers/NewBill.js"
import pct from "../assets/svg/pct.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage.js";


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
      let file
      let filedata
      let changefile
      test("Then it should get the file datas", () =>{
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const newbill = new NewBill({
          document, onNavigate, store: null, localStorage: window.localStorage
        })
        file = screen.getAllByTestId("file")[0]
        filedata = {
          file: "image.png"
        };
        changefile = jest.fn((e)=> newbill.handleChangeFile(e))
        file.addEventListener("change", changefile)
        fireEvent.change(file, {target: { files: [new File(["image"], filedata.file)], testfilevalid: "image.png"}});
        expect(changefile).toHaveBeenCalled()
        expect(filevalid).toBe(true)
      })
      describe("When i give a wrong file", () =>{
        test("validfile should be false", () =>{
          fireEvent.change(file, {target: { files: [new File(["image"], filedata.file)], testfilevalid: "image.notpng"}});
          expect(changefile).toHaveBeenCalled()
          expect(filevalid).toBe(false)
        })
      })
    })
    describe("when i click on submit button", ()=>{
      test("Then it should POST the form",  ()=>{
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const newbill = new NewBill({
          document, onNavigate, store: mockStore, localStorage: localStorageMock
        })
        const form = screen.getAllByTestId("form-new-bill")[0]
        const billname = screen.getAllByTestId("expense-name")[0]
        const file = screen.getAllByTestId("file")[0]

        const filedata = {
          file: "image.png"
        };
        fireEvent.change(file, {target: { files: [new File(["image"], filedata.file)], testfilevalid: "image.png"}});
        const submit = jest.fn((e)=> newbill.handleSubmit(e))
        form.addEventListener("submit", submit)
        fireEvent.change(billname, {target: {value: "Test post"}})
        fireEvent.submit(form)
        expect(submit).toHaveBeenCalled()
      })
    })
  })
})
