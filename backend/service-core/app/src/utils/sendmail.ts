import { readFileSync } from 'fs'
import nodemailer from 'nodemailer'
import { NODEMAILER_CREDS } from '../config/config'
import { Address, User } from './validators'

const gmailCreds = readFileSync(NODEMAILER_CREDS)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  secure: false,
  auth: {
    user: gmailCreds.toString().split('\n')[0],
    pass: gmailCreds.toString().split('\n')[1],
  },
})

function emailRegBody(name: string, code: string, codeStr: string) {
  return `Hello, ${name},\n
You've just registered in our IoT platform "Mergen Savdag" \n
To finish registration, please, enter the code ${code} \n
Or click the link: https:\/\/api.mergensavdag.com/verify/${codeStr}/${code} \n
\n
\n
Best regards,
The Mergen Savdag team.`
}

export async function sendRegisterMail(data: { email: string, name: string, code: string, codeStr: string }) {
  try {
    const info = await transporter.sendMail({
      from: gmailCreds.toString().split('\n')[0],
      to: data.email,
      subject: 'Mergen Savdag',
      text: emailRegBody(data.name, data.code, data.codeStr),
    })
    return info
  } catch (e) {
    console.error(e)
    return
  }
}

function emailAdminBody(address: Address, user: User) {
  let addressDetail = ''
  if (address.subdistrict)
    addressDetail = ', ' + address.subdistrict
  if (address.street)
    addressDetail += ', ' + address.street
  if (address.buildings)
    addressDetail += ', ' + address.buildings

  let accountCreds = '\n'
  if (user.password)
    accountCreds = `
To enter to your account please use e-mail and password below:\n
\tLogin:    ${user.email}\n
\tPassword: ${user.password}\n
`

  return `Dear Customer,\n
We are glad to inform you that you have been granted administrator privileges in our smart \n
barrier system "Mergen Savdag". From this day you will manage ${address.name} living complex \n
which address is: ${address.city}, ${address.district}${addressDetail}. \n
${accountCreds}
\n
\n
Best regards,
The Mergen Savdag team.`
}


export async function sendAdminNotification(user: User, address: Address) {
  try {
    const info = await transporter.sendMail({
      from: gmailCreds.toString().split('\n')[0],
      to: user.email,
      subject: 'Mergen Savdag',
      text: emailAdminBody(address, user),
    })
    return info
  } catch (e) {
    console.log(e)
    return
  }
}