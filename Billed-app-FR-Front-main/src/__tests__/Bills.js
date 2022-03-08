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
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    describe("When i click on icon eye", () => {
      test("then modal should open", () => {
        const iconeye = screen.getAllByTestId("icon-eye")[1]
        const funct = jest.fn(() => bill.handleClickIconEye(iconeye))
        iconeye.addEventListener('click', funct)
        userEvent.click(iconeye)
        const modale = screen.getByTestId("modaleFile")
        expect(modale.getAttribute("aria-hidden")).toBe("false")
      })
    })
    describe("when i click on NewBill button", () => {
      test("Then Form for a new bill should appear", () => {
        const buttonNewBill = screen.getByTestId("btn-new-bill")
        const funct = jest.fn(() => bill.handleClickNewBill())
        buttonNewBill.addEventListener('click', funct)
        userEvent.click(buttonNewBill)
        expect(funct).toHaveBeenCalled()
      })
    })
  })
})
