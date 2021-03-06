import swal from 'sweetalert2'
import template from './peopleList.html'
import { initWeb3, htmlToElement } from 'apps/utils'
import contractFactory from './contract'

const web3 = initWeb3()

class PeopleListApp extends HTMLElement {
  connectedCallback () {
    this.innerHTML = template
    this.contract = contractFactory(web3)
    this.getAccount()
    this.attachEventListeners()
    this.inputName = this.querySelector('[data-person-name]')
    this.inputBirthdate = this.querySelector('[data-person-birthdate]')
    this.inputSex = this.querySelector('[data-person-sex]')
  }

  async getAccount () {
    [this.account] = await web3.eth.getAccounts()
  }

  attachEventListeners () {
    this.querySelector('[data-deploy]').addEventListener('click', () => {
      this.deploy(this.account)
    })

    this.querySelector('[data-connect]').addEventListener('click', () => {
      this.connect(this.querySelector('[data-input-contract]').value)
    })

    this.querySelector('[data-add]').addEventListener('click', () => {
      this.add()
    })
  }

  async deploy (owner) {
    try {
      await this.contract.deploy(owner)
      this.querySelector('[data-contract-address]').innerText = this.contract.address
      await this.list()
    } catch (e) {
      swal({
        title: 'Error!',
        text: e.message,
        type: 'error'
      })
    }
  }

  async connect (address) {
    try {
      await this.contract.connect(address)
      this.querySelector('[data-contract-address]').innerText = this.contract.address
      await this.list()
    } catch (e) {
      swal({
        title: 'Error!',
        text: e.message,
        type: 'error'
      })
    }
  }

  async add () {
    const person = {
      name: this.inputName.value,
      birthdate: new Date(this.inputBirthdate.value).getTime(),
      sex: this.inputSex.value
    }

    await this.contract.add({
      person,
      address: this.account
    })

    await this.list()
  }

  async list () {
    const users = await this.contract.list()

    const list = this.querySelector('[data-events-list]')
    list.innerHTML = ''
    users
      .map(user => htmlToElement(`<div class="item">${user.name}</div>`))
      .forEach(element => {
        list.appendChild(element)
      })
  }
}

window.customElements.define('eth-people-list', PeopleListApp)
