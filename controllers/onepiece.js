const schedule = require('node-schedule')
const Manga = require('../models/manga')
const Channel = require('../models/channel') 
const axios = require('axios')
const Discord = require('discord.js')
let globalClient;

// Update the Manga Database 
const updateMangaDatabase = async (newObject, OnePieceManga) => {
    try {
        await Manga.findByIdAndUpdate(OnePieceManga._id, newObject, {new: true})
    } catch(err) {
        console.log(err)
    }
}

// Send the message to all the channels in Channel database
const dispatch = async (message) => {
    const channels = await Channel.find({})
    
    for(let ind in channels){
        try{
            globalClient.channels.cache.get(channels[ind].channelId).send(message)
        } catch(err) {
            console.log(err)
        }
    }
}

// Get the One Piece Manga details from Manga database
const getOnePieceManga = async () => {
    try {
        const OnePieceManga = await Manga.find({name: "One Piece"})
        return OnePieceManga[0]
    } catch(err) {
        console.log(err)
    }
}

// Get JSON data from the One Piece subreddit
const getOPSubredditJSON = async () => {
    const url = 'https://www.reddit.com/r/OnePiece/.json'
    try {
        const response = await axios.get(url)
        return response.data.data.children
    } catch(err) {
        console.log(err);
    }
}

// Check if the Spoilers of new chapter have been posted
const checkNewChapterSpoilers = (OnePieceManga, topPosts) => {
    const newChapter = OnePieceManga.spoilersLastChapter + 1
    const titleString = `One Piece chapter ${newChapter} spoilers`

    const post = topPosts.find(post => post.data.title===titleString)

    if(post){
        // message to send to all channels
        const messageEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(post.data.title)
                .setURL(post.data.url)
                .setDescription('Click on title to go to reddit post.')
        
        dispatch(messageEmbed)

        // update Manga database
        const newObject = {
            spoilersLastChapter: newChapter,
            spoilersText: post.data.selftext
        }

        updateMangaDatabase(newObject, OnePieceManga)

        return true
    }
    
    return false
}

// check if spoilers of the current chapter have been updated
const checkUpdateOfLastChapterSpoilers = (OnePieceManga, topPosts) => {
    const lastChapter = OnePieceManga.spoilersLastChapter
    const lastChapterSpoilers = OnePieceManga.spoilersText
    const titleString = `One Piece chapter ${lastChapter} spoilers`

    const post = topPosts.find(post => post.data.title===titleString)

    if(post && post.data.selftext!==lastChapterSpoilers){
        // message to send to all channels
        const messageEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`UPDATED - ${post.data.title}`)
                .setURL(post.data.url)
                .setDescription('Click on title to go to reddit post.')

        // dispatch message
        dispatch(messageEmbed)
        console.log(`UPDATED - ${post.data.title}`)

        // update database
        const newObject = {
            spoilersText: post.data.selftext
        }

        updateMangaDatabase(newObject, OnePieceManga)
    }
}

// check if the new manga chapter has been released
const checkNewChapterReleased = (OnePieceManga, topPosts) => {
    const newChapter = OnePieceManga.mangaLastChapter + 1
    const titleString = `One Piece: Chapter ${newChapter}`

    const post = topPosts.find(post => post.data.title===titleString)

    if(post){
        // message to send to all channels
        const messageEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`RELEASED - ${post.data.title}`)
                .setURL(post.data.url)
                .setDescription('Click on title to go to reddit post.')

        // dispatch message
        dispatch(messageEmbed)
        console.log(`RELEASED - ${post.data.title}`)

        // update database
        const newObject = {
            mangaLastChapter: newChapter
        }

        updateMangaDatabase(newObject, OnePieceManga)
    }
}

// scheduler to check for updates every 5 minutes
const checkUpdates = (client) => {
    globalClient = client

    const check = schedule.scheduleJob('*/5 * * * *', async () => {
        try {
            const OnePieceManga = await getOnePieceManga()
            const OPSubredditJSON = await getOPSubredditJSON()
    
            // The required posts are always pinned i.e have an attribute stickied=true
            const topPosts = OPSubredditJSON.filter(post => post.data.stickied===true)
    
            if (!checkNewChapterSpoilers(OnePieceManga, topPosts)){
                checkUpdateOfLastChapterSpoilers(OnePieceManga, topPosts)
            }
            checkNewChapterReleased(OnePieceManga, topPosts)
    
        } catch(err) {
            console.log(err)
        }
    })
    check
}

module.exports = {checkUpdates}