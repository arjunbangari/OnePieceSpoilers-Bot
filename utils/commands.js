const Channel = require('./../models/channel')

// !subscribe command
const subscribe = async (message) => {
    try{
        const channelId = message.channel.id
        const channelExists = await Channel.find({channelId})
        
        if(channelExists.length!==0){
            throw 'ChannelAlreadyExists'
        }

        const channel = new Channel({channelId})
        await channel.save()

        message.channel.send('Subscribed successfully, you will recieve updates from now on')

    } catch(err) {
        console.log(err)

        if(err==='ChannelAlreadyExists') {
            message.channel.send('You are already subscribed!')
        } else {
            message.channel.send('There was an error, please try again later')
        }
    }  
}

// !unsubscribe command
const unsubscribe = async (message) => {
    try{
        const channelId = message.channel.id
        const requiredChannel = await Channel.find({channelId})
        const id = requiredChannel[0]._id
        await Channel.findByIdAndDelete(id)
        message.channel.send('Unsubscribed successfully, you will no longer recieve updates.')
    } catch(err) {
        console.log(err.name)
        if(err.name==="TypeError"){
            message.channel.send('You are not subscribed. Please subscribe first.')
        } else {
            message.channel.send('Sorry, there was an error.')
        }
        
    }
}

// help command
const helpCommand = (message) => {
    message.channel.send('Use command !subscribe to get updates and !unsubscribe to stop getting updates.')
}

module.exports = {subscribe, unsubscribe, helpCommand}
