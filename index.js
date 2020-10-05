const { create, Client } = require('@open-wa/wa-automate')
const welcome = require('./lib/welcome')
const msgHandler = require('./msgHndlr')
const options = require('./options')

const start = async (client = new Client()) => {
        console.log('[SERVER] Server Started!')
        // Force it to keep the current session
        client.onStateChanged((state) => {
            console.log('[Client State]', state)
            if (state === 'CONFLICT' || state === 'UNLAUNCHED') client.forceRefocus()
        })
        // listening on message
        client.onMessage((async (message) => {
            client.getAmountOfLoadedMessages()
            .then((msg) => {
                if (msg >= 3000) {
                    client.cutMsgCache()
                }
            })
            msgHandler(client, message)
        }))

        client.onGlobalParicipantsChanged((async (heuh) => {
            await welcome(client, heuh)
            //left(client, heuh)
            }))
        
        client.onAddedToGroup(({ groupMetadata: { id }, contact: { name } }) =>
        client.getGroupMembersId(id)
            .then((ids) => {
                console.log('[CLIENT]', color(`Invited to Group. [ ${name} : ${ids.length}]`, 'yellow'))
                // conditions if the group members are less than 50 then the bot will leave the group
                if (ids.length <= 5) {
                    client.sendText(id, 'Sorry, the minimum group member is 10 user to use this bot. Bye~').then(() => client.leaveGroup(id))
                } else {
                    client.sendText(id, `Hello group members *${name}*, thank you for inviting this bot, to see the bot menu send *#menu*`)
                }
            }))
     // listening on Incoming Call
        client.onIncomingCall((call) => {
            client.sendText(call.peerJid, 'Maaf, saya tidak bisa menerima panggilan. nelfon = block!.\nbila ingin di unblock kamu harus bedonasi dan hubungi whatsapp admin: 081311850715 ')
            client.contactBlock(call.peerJid)
            //ban.push(call.peerJid)
            //fs.writeFileSync('./lib/banned.json', JSON.stringify(ban))
        })

create('BarBar', options(true, start))
    .then(client => start(client))
    .catch((error) => console.log(error))