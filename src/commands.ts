import { SlackCommandMiddlewareArgs } from "@slack/bolt"
import Channel from './models/Channel'

export async function allowCowCommand({ ack, command, say }: SlackCommandMiddlewareArgs) {
  if (!command.channel_id.startsWith('C')) { // private starts with G
    await ack()
    await say(`<@${command.user_id}>:I don't want to join this private channel. Perhaps try in a public channel?`)
    return
  }

  await Channel.updateOne(
    { channelId: command.channel_id },
    { $set: { 
      channelId: command.channel_id,
      cowAllowed: true
    }},
    { upsert: true }
  )

  await ack()
  await say(`<@${command.user_id}>: BAAA!!! This is a nice channel! You can now mention me (\`@goat <your message>\`) to summon me and start an awesome conversation! :goat: \n_Type \`/leave-goat\` to block me from speaking in this channel_`)
}

export async function blockCowCommand({ ack, command, say }: SlackCommandMiddlewareArgs) {
  if (command.channel_id === process.env.COW_HOME_CHANNEL) { // private starts with G
    await ack()
    await say(`<@${command.user_id}>: I'm not going to leave my own home. I'm not stupid :goat:`)
    return
  }

  await Channel.updateOne(
    { channelId: command.channel_id },
    { $set: { 
      channelId: command.channel_id,
      cowAllowed: false
    }},
    { upsert: true }
  )

  await ack()
  await say(`<@${command.user_id}>: Bye! I'm sad that you don't want me :frowning: but I hope you'll visit me at <#${process.env.COW_HOME_CHANNEL}>. \n_Type \`/allow-goat\` to let me speak in this channel_`)
}

export async function cowInfoCommand({ ack, command, say }: SlackCommandMiddlewareArgs) {
  await ack()
  await say(`<@${command.user_id}>: Hey! :wave: I'm the Hack Club Goat :goat:. I am a friendly goat AI (<https://github.com/jasonappah/goat|github>) powered by GPT-3's Curie engine. I'm here to have fun and hang out. My code is forked from <https://github.com/hackclub/cow2|cow>, but don't worry, I'm much better. You can visit my home and find announcements at <#${process.env.COW_HOME_CHANNEL}>! To allow me to visit your channel, type \`/allow-goat\`.\n\nYou can start a conversation with me in any allowed channel by just @mentioning me with any question (this will summon me into your channel and away from any other channel I'm currently visiting). Try asking me to tell you a joke, how I am, what I did today, etc. You can respond to me in a thread and I'll hopefully remember the context of our conversation. _hint: if I'm telling you a story or joke or something else, you can type "continue" to make me continue my story without interupting._\n\nGPT-3 tokens aren't free, so I do have a daily word limit. The word count grows cumulatively within each conversation (thread) as the entire conversation is sent to the API with each interaction. So, if you want to change topics please start a new thread. \n\nAlso, remember that I'm powered by an experimental AI trained on data from the internet, so no one can claim responsibility for what I say. If I ever accidentally say something bad you can react with :x: to vote to remove it.\n\nPlease be nice, and don't try to spam or abuse me. All conversations are logged so don't try to trick me into saying something too inappropriate or rude. Also please don't be selfish and use up my daily quota all by youself. If you do, my creator will have add per-user limits :(\n\nI can't wait to talk to you about goats and hacking! :goat:`)
}
