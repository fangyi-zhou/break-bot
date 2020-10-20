const Eris = require("eris");
const process = require("process");
const excuses = require("huh");
const moment = require("moment");

let bot = new Eris(process.env.DISCORD_BOT_TOKEN);

let channelsToMessage;

function loadChannelsToMessage() {
  let channels = [];
  for (const [_, guild] of bot.guilds) {
    for (const [id, channel] of guild.channels) {
      if (channel.name === "general") {
        console.log(`Found #general of ${guild.name}, ID ${id}`)
        channels.push(channel);
      }
    }
  }
  channelsToMessage = channels;
}

function getMessageContent() {
  const excuse = excuses.get();
  return "It's time for a break because " + excuse;
}

function sendMessage() {
  for (const channel of channelsToMessage) {
    const messageContent = getMessageContent();
    channel.createMessage(messageContent);
  }
  scheduleMessage();
}

function isHoliday(moment) {
  // TODO: Include bank holiday and college closure days
  return moment.day() == 0 || moment.day() == 6;
}

function getTimeToNextBreak() {
  const now = moment();
  let nextBreak = moment();
  nextBreak.hour(15);
  nextBreak.minute(30);
  if (!nextBreak.isAfter(now)) {
    nextBreak.add(1, 'd');
  }
  while (isHoliday(nextBreak)) {
    nextBreak.add(1, 'd');
  }
  console.log(`Next Break is at ${nextBreak.toString()}`)
  return moment.duration(nextBreak.diff(now)).as('milliseconds');
}

function scheduleMessage() {
  const offset = getTimeToNextBreak();
  console.log(`Scheduled break message after ${offset} ms`)
  setTimeout(sendMessage, offset);
}

bot.on("ready", () => {
  loadChannelsToMessage();
  scheduleMessage();
  console.log("Bot ready")
});

bot.connect();
