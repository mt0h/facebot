import prepareSendMail from "@italodeandra/next/mailer/sendMail";

const sendMail = prepareSendMail({
  product: {
    name: "Facebot",
    link: "https://facebot.italodeandra.de/",
    logo: "https://facebot-d63e21bbc96d.herokuapp.com/android-chrome-512x512.png",
    copyright: `&copy; ${new Date().getFullYear()} <a href="https://facebot.italodeandra.de/" target="_blank">Facebot</a>`,
  },
});

export default sendMail;
