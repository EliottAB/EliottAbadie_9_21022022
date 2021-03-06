/**
 * @jest-environment jsdom
 */

import {getByTestId, screen, wait, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import { ROUTES } from "../constants/routes"
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const bill = new Bills({
      document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
    })
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toBe(document.querySelector(".active-icon"))
    })
    test("fetches bills from mock API GET", async () => {
      const spyBills = jest.spyOn(mockStore, "bills");
      const isBills = mockStore.bills();
      const res = await isBills.list();
      expect(spyBills).toHaveBeenCalledTimes(1)
      expect(res.length).toBe(4)
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const bill = new Bills({
        document, onNavigate, store: mockStore, bills:res, localStorage: window.localStorage
      })
      bill.getBills();
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => 
          Promise.reject(new Error('Erreur 404'))
        )
        const html = BillsUI({ error: 'Erreur 404' })
        document.body.innerHTML = html
        const message = screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => 
          Promise.reject(new Error('Erreur 500'))
        )
        const html = BillsUI({ error: 'Erreur 500' })
        document.body.innerHTML = html
        const message = screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    describe("When i click on icon eye", () => {
      test("then modal should open", () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const bill = new Bills({
          document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
        })
        const iconeye = screen.getAllByTestId("icon-eye")[0]
        const clickiconeye = jest.fn(()=> bill.handleClickIconEye(iconeye));
        $.fn.modal = jest.fn();
        iconeye.addEventListener('click', clickiconeye)
        userEvent.click(iconeye)
        expect(clickiconeye).toHaveBeenCalled()
        expect($.fn.modal).toHaveBeenCalled()
      })
    })
    describe("when i click on NewBill button", () => {
      test("Then Form for a new bill should appear", () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const bill = new Bills({
          document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
        })
        const buttonNewBill = screen.getByTestId("btn-new-bill")
        const funct = jest.fn(() => bill.handleClickNewBill())
        buttonNewBill.addEventListener('click', funct)
        userEvent.click(buttonNewBill)
        expect(funct).toHaveBeenCalled()
      })
    })
  })
})
