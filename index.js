const config = require('./utils/config')
const Discord = require('discord.js')
const client = new Discord.Client()
const mongoose = require('mongoose')
const commands = require('./utils/commands')
const onePieceUpdates = require('./controllers/onepiece')

// connect to database
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

client.on('guildCreate', guild => {
    const channel = guild.channels.cache.find(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'))
    channel.send("Thanks for inviting me! Use the command !help in the channel you want to get updates in.")
})

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`)
    onePieceUpdates.checkUpdates(client)
})


client.on("message", (message) => {
    if(message.content==="!subscribe"){
        commands.subscribe(message)
    } else if(message.content==="!unsubscribe"){
        commands.unsubscribe(message)
    } else if(message.content==="!help"){
        commands.helpCommand(message)
    }
})

client.login(config.TOKEN)

