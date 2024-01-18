import Head from 'next/head'
import { Inter } from 'next/font/google'
import { Flex, Grid, View, WithAuthenticatorProps, useTheme, withAuthenticator } from '@aws-amplify/ui-react'
import { type Schema } from '@/amplify/data/resource'
import { useEffect, useState } from 'react'
import { ThreadLink } from '@/components/ThreadLink'
import { client } from '@/models/clients/supportDataClient';
import { MessageUpdate, SupportThreadManager } from '@/models/SupportThreadManager';
import { SupportThreadChatBox } from '@/components/SupportThreadChatBox'
import { Observable, Subscription } from 'rxjs'

const inter = Inter({ subsets: ['latin'] })

function Support({ signOut, user }: WithAuthenticatorProps) {
  const { tokens } = useTheme();
  const [threads, setThreads] = useState<Schema['Thread'][]>([]);
  const [displayedMessages, setDisplayedMessages] = useState<Schema['Message'][]>([]);
  const [selectedThread, setSelectedThread] = useState<Schema['Thread']>()
  const [supportThreadManager, setSupportThreadManager] = useState<SupportThreadManager>()


  useEffect(() => {
    const sm = new SupportThreadManager();
    setSupportThreadManager(sm)
    sm.threadChanges().subscribe(() => {
      setThreads(sm.getCurrentThreads)
    })
  }, [])



  useEffect(() => {
    let sub: Subscription;
    if (supportThreadManager && selectedThread) {
      setDisplayedMessages(supportThreadManager.getCurrentMessagesFor(selectedThread) ?? [])
      
      sub = supportThreadManager.messageChangesFor(selectedThread).subscribe((type) => {
        if(type === 'message') {
          setDisplayedMessages(supportThreadManager.getCurrentMessagesFor(selectedThread) ?? [])
        }
      })
    }
    return () => sub?.unsubscribe();
  }, [selectedThread])

  return (
    <>
      <Head>
        <title>Support Chat</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        
        <Flex direction={'column'} width="100%">
          <Grid height={'100vh'} maxHeight={'100vh'}
            templateColumns={{ base: '20rem 1fr', }}
            templateRows={{ base: '50px 9fr' }}
            gap={tokens.space.small}
            className=' w-max'
          >
            <View
              columnSpan={2}
            >
              <h1 className='text-4xl m-2'>Support Center</h1>
              <div className="absolute top-4 right-8"><button onClick={signOut}>Sign out</button></div>
            </View>
            <View className="overflow-y-scroll no-scrollbar" marginRight={2}
              rowSpan={{ base: 2 }}
            >
                  {supportThreadManager && threads.map((t) => (
                    <ThreadLink
                      key={t.id}
                      thread={t}
                      isSelected={selectedThread?.id === t.id}
                      setSelectedThread={setSelectedThread}
                      getCount={() => (supportThreadManager.getCurrentMessagesCountFor(t) ?? 0)}
                      threadMessagesChanged={supportThreadManager.messageChangesFor(t)}
                    />
                  ))}
            </View>
            <View className="overflow-y-auto">
              {selectedThread && <SupportThreadChatBox thread={selectedThread} messages={displayedMessages} />}
            </View>
          </Grid>
        </Flex>
      </main>
    </>
  )
}

export default withAuthenticator(Support)