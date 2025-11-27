import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import { dialogueGenerator } from '../utils/DialogueGenerator';
import { MicroCivilization, calculateFederationBonus } from '../entities/MicroCivilization';
import SquishyButton from './SquishyButton';
import '../styles/app-juice.css';

/**
 * HateMail & Diplomacy System
 * 
 * Handles interactions with micro-civilizations.
 */
export default function HateMail({ gameState, dispatch }) {
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [pendingDecision, setPendingDecision] = useState(null);
    const [spamMessages, setSpamMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('INBOX'); // 'INBOX' or 'SPAM'

    useEffect(() => {
        // Listen for civilization events
        eventBus.on(EVENT_TYPES.CIVILIZATION_CONTACT, handleCivilizationContact);
        eventBus.on(EVENT_TYPES.OBSTACLE_DESTROYED, handleObstacleDestroyed);
        eventBus.on(EVENT_TYPES.TERRITORY_EXPANDED, handleTerritoryExpanded);
        eventBus.on('YELP_REVIEW_BOMB', handleYelpReviewBomb);

        // Spam Generator Loop
        const spamInterval = setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance per tick (approx every 10-30s depending on tick rate? No, this is interval)
                // Actually let's make it every 10 seconds check
                generateSpam();
            }
        }, 10000);

        return () => {
            eventBus.off(EVENT_TYPES.CIVILIZATION_CONTACT, handleCivilizationContact);
            eventBus.off(EVENT_TYPES.OBSTACLE_DESTROYED, handleObstacleDestroyed);
            eventBus.off(EVENT_TYPES.TERRITORY_EXPANDED, handleTerritoryExpanded);
            eventBus.off('YELP_REVIEW_BOMB', handleYelpReviewBomb);
            clearInterval(spamInterval);
        };
    }, []);

    const handleYelpReviewBomb = () => {
        // Generate 3-5 angry emails
        const count = 3 + Math.floor(Math.random() * 3);

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const senders = ["Karen from Galaxy HOA", "Concerned Citizen #492", "Anonymous Neighbor", "The Mold Next Door", "Space Karen"];
                const subjects = ["NOISE COMPLAINT", "Your lawn is a disgrace", "About the smell...", "UNACCEPTABLE BEHAVIOR", "I'm calling the manager"];
                const texts = [
                    "I saw what you did. The whole sector saw it. 1 star.",
                    "My kids are crying because you wouldn't share your Flux. Hope you're happy.",
                    "This establishment has gone downhill since the Big Bang.",
                    "Rude. Just rude. I'm telling the Federation.",
                    "The vibe is off. Fix it or we sue."
                ];

                const civ = new MicroCivilization(0, 0);
                civ.name = senders[Math.floor(Math.random() * senders.length)];
                civ.color = '#FF0000';
                civ.personality = 'Angry';

                const message = {
                    id: `msg-yelp-${Date.now()}-${i}`,
                    civilization: civ,
                    type: 'INSULT',
                    text: texts[Math.floor(Math.random() * texts.length)],
                    timestamp: Date.now(),
                    requiresDecision: true
                };

                addMessage(message);

                // Play notification sound
                // Play notification sound
                import('../engine/audio').then(({ audioManager }) => {
                    audioManager.playSound('notification');
                });

            }, i * 800); // Stagger them
        }
    };

    const generateSpam = () => {
        const spamTemplates = [
            // SCAMS
            {
                sender: "Nigerian Prince (Real)",
                subject: "URGENT: ROYAL INHERITANCE",
                text: "Dearest Friend, I have 50,000,000 Stardust trapped in a gravity well. Send 500 Flux to release it and we split 50/50."
            },
            {
                sender: "Galactic IRS",
                subject: "FINAL NOTICE: TAX AUDIT",
                text: "You have unpaid entropy taxes. Pay immediately or we will repossess your kneecaps."
            },
            {
                sender: "Totally Not A Virus",
                subject: "Download more RAM?",
                text: "Your node is running slow. Click here to download 128TB of dedotated wam. [DOWNLOAD.EXE]"
            },

            // ADS
            {
                sender: "Hot Singles",
                subject: "Single Microbes in Your Area",
                text: "They are looking for a connection! No resistance attached. 100% conductivity guaranteed."
            },
            {
                sender: "The Void Marketing",
                subject: "Embrace the Nothingness",
                text: "Tired of existence? Try Non-Existence™! Now with 50% less suffering."
            },
            {
                sender: "Big Pharma",
                subject: "ENLARGE YOUR NODE",
                text: "Is your bandwidth lacking? Try our new experimental supplements. Warning: May cause spontaneous combustion."
            },
            {
                sender: "Space Groupon",
                subject: "90% OFF BLACK HOLES",
                text: "Limited time offer! Buy one Singularity, get one Event Horizon free. *No returns.*"
            },

            // NONSENSE / LORE
            {
                sender: "Future You",
                subject: "DON'T DO IT",
                text: "Whatever you're thinking of doing right now... don't. Also, invest in pumpkins."
            },
            {
                sender: "Cat.exe",
                subject: "Meow",
                text: "Meow meow meow meow. [Attached: dead_bird.jpg]"
            },
            {
                sender: "Bureau of Bureaucracy",
                subject: "Form 27B/6 Pending",
                text: "Your application to exist has been received. Current wait time: 4000 years."
            },
            {
                sender: "Grandma",
                subject: "FW: FW: FW: RE: Funny Cat",
                text: "LOOK AT THIS IT REMINDED ME OF YOU LOVE GRANDMA"
            },
            {
                sender: "Unknown",
                subject: "I know what you are",
                text: "I saw you click that button. I saw it."
            },
            {
                sender: "Glitch_404",
                subject: "h̴e̴l̴p̴ ̴m̴e̴",
                text: "I'm t̴r̴a̴p̴p̴e̴d̴ in the s̴p̴a̴m̴ folder. It's d̴a̴r̴k̴ in here."
            }
        ];

        const template = spamTemplates[Math.floor(Math.random() * spamTemplates.length)];

        const spam = {
            id: `spam-${Date.now()}-${Math.random()}`,
            sender: template.sender,
            subject: template.subject,
            text: template.text,
            timestamp: Date.now(),
            type: 'SPAM'
        };

        setSpamMessages(prev => [spam, ...prev]);
    };

    const handleDeleteAllSpam = () => {
        const count = spamMessages.length;
        if (count > 0) {
            setSpamMessages([]);
            dispatch({ type: 'ADD_RESOURCE', payload: { resource: 'stardust', amount: count } });
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: `Deleted ${count} spam emails. Gained ${count} Stardust. Reduce, reuse, recycle.`
            });
        }
    };

    const handleCivilizationContact = (data) => {
        const { civilization } = data;
        const message = createDiplomaticMessage(civilization);
        addMessage(message);
    };

    const handleObstacleDestroyed = (data) => {
        // 30% chance to spawn a civilization complaint
        if (Math.random() < 0.3) {
            const civ = createRandomCivilization(data.x, data.y);
            const message = createInsultMessage(civ, 'destruction');
            addMessage(message);
        }
    };

    const handleTerritoryExpanded = (data) => {
        // 20% chance for expansion complaint
        if (Math.random() < 0.2) {
            const civ = createRandomCivilization(data.x, data.y);
            const message = createInsultMessage(civ, 'expansion');
            addMessage(message);
        }
    };

    const createRandomCivilization = (x, y) => {
        return new MicroCivilization(x, y);
    };

    const createDiplomaticMessage = (civilization) => {
        return {
            id: `msg-${Date.now()}`,
            civilization,
            type: 'DIPLOMATIC',
            text: dialogueGenerator.generateDiplomaticMessage(civilization.name, civilization.personality),
            timestamp: Date.now(),
            requiresDecision: true,
        };
    };

    const createInsultMessage = (civilization, reason) => {
        return {
            id: `msg-${Date.now()}`,
            civilization,
            type: 'INSULT',
            text: dialogueGenerator.generateInsult(civilization.name, reason),
            timestamp: Date.now(),
            requiresDecision: true,
        };
    };

    const addMessage = (message) => {
        setMessages(prev => [message, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Auto-open if not already open
        if (!isOpen) {
            setTimeout(() => {
                setIsOpen(true);
            }, 500);
        }
    };

    const handleDecision = (decision, message) => {
        const { civilization } = message;

        switch (decision) {
            case 'IGNORE':
                // Risk future conflict
                civilization.modifyRelationship(-10);
                dispatch({ type: 'IGNORE_CIVILIZATION', civilization });
                break;

            case 'VASSAL':
                // Requires Lucidity investment
                const lucidityRequired = 50;
                if (gameState.resources.lucidity >= lucidityRequired) {
                    const { tributeRate, fluxRate } = civilization.becomeVassal(lucidityRequired);
                    dispatch({
                        type: 'CREATE_VASSAL',
                        civilization,
                        lucidityRequired,
                        tributeRate,
                        fluxRate
                    });
                    eventBus.emit(EVENT_TYPES.VASSAL_CREATED, { civilization });
                } else {
                    // Not enough resources
                    alert(`Need ${lucidityRequired} Lucidity to create vassal!`);
                    return;
                }
                break;

            case 'DESTROY':
                // Immediate resources
                const rewards = civilization.getDestructionRewards();
                dispatch({
                    type: 'DESTROY_CIVILIZATION',
                    civilization,
                    stardust: rewards.stardust,
                    lucidity: rewards.lucidity
                });
                eventBus.emit(EVENT_TYPES.CIVILIZATION_DESTROYED, { civilization, rewards });
                break;
        }

        // Remove message
        setMessages(prev => prev.filter(m => m.id !== message.id));
        setPendingDecision(null);
    };

    const toggleMailbox = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0);
        }
    };

    // Calculate federation bonus from vassals
    const vassals = gameState.civilizations?.filter(c => c.isVassal) || [];
    const federationBonus = calculateFederationBonus(vassals);

    return (
        <div className="hud-mailbox">
            {/* Mailbox Icon */}
            <SquishyButton
                className="hud-mailbox__icon"
                onClick={toggleMailbox}
                preset="BOUNCY"
                style={{
                    padding: '5px',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <img
                    src="/assets/mailbox_icon.png"
                    alt="Mailbox"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                />
                {unreadCount > 0 && (
                    <span className="hud-mailbox__badge">{unreadCount}</span>
                )}
            </SquishyButton>

            {/* Messages Panel */}
            {isOpen && (
                <div className="hud-mailbox__panel">
                    <div className="hud-mailbox__header">
                        <h3>Micro-Civilization Communications</h3>
                        {vassals.length > 1 && (
                            <div className="hud-mailbox__federation">
                                Federation Bonus: +{((federationBonus - 1) * 100).toFixed(0)}%
                            </div>
                        )}
                        <SquishyButton className="hud-mailbox__close" onClick={toggleMailbox} preset="STIFF">×</SquishyButton>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #00FFFF' }}>
                        <div
                            onClick={() => setActiveTab('INBOX')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: activeTab === 'INBOX' ? 'rgba(0, 255, 255, 0.2)' : 'transparent',
                                color: activeTab === 'INBOX' ? '#00FFFF' : '#888'
                            }}
                        >
                            INBOX ({messages.length})
                        </div>
                        <div
                            onClick={() => setActiveTab('SPAM')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: activeTab === 'SPAM' ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
                                color: activeTab === 'SPAM' ? '#FF4444' : '#888'
                            }}
                        >
                            SPAM ({spamMessages.length})
                        </div>
                    </div>

                    <div className="hud-mailbox__messages">
                        {activeTab === 'INBOX' ? (
                            messages.length === 0 ? (
                                <p className="hud-mailbox__empty">No messages</p>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className="hud-mailbox__letter">
                                        <div className="hud-mailbox__letter-header">
                                            <span
                                                className="hud-mailbox__civ-name"
                                                style={{ color: msg.civilization.color }}
                                            >
                                                {msg.civilization.name}
                                            </span>
                                            <span className="hud-mailbox__personality">
                                                ({msg.civilization.personality})
                                            </span>
                                        </div>

                                        <p className="hud-mailbox__text">{msg.text}</p>

                                        {msg.requiresDecision && (
                                            <div className="hud-mailbox__actions">
                                                <SquishyButton
                                                    className="hud-button hud-button--ignore"
                                                    onClick={() => handleDecision('IGNORE', msg)}
                                                    preset="GENTLE"
                                                >
                                                    Ignore
                                                </SquishyButton>
                                                <SquishyButton
                                                    className="hud-button hud-button--vassal"
                                                    onClick={() => handleDecision('VASSAL', msg)}
                                                    title="Cost: 50 Lucidity"
                                                    preset="WOBBLY"
                                                >
                                                    Make Vassal (50 LUC)
                                                </SquishyButton>
                                                <SquishyButton
                                                    className="hud-button hud-button--destroy"
                                                    onClick={() => handleDecision('DESTROY', msg)}
                                                    preset="BOUNCY"
                                                >
                                                    Destroy
                                                </SquishyButton>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )
                        ) : (
                            /* SPAM TAB */
                            <>
                                {spamMessages.length > 0 && (
                                    <SquishyButton
                                        onClick={handleDeleteAllSpam}
                                        preset="BOUNCY"
                                        style={{
                                            width: '100%',
                                            marginBottom: '10px',
                                            background: '#FF4444',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px'
                                        }}
                                    >
                                        DELETE ALL SPAM (+1 Stardust/msg)
                                    </SquishyButton>
                                )}
                                {spamMessages.length === 0 ? (
                                    <p className="hud-mailbox__empty">No spam (yet)</p>
                                ) : (
                                    spamMessages.map(msg => (
                                        <div key={msg.id} className="hud-mailbox__letter" style={{ borderColor: '#FF4444', background: 'rgba(255, 0, 0, 0.05)' }}>
                                            <div className="hud-mailbox__letter-header">
                                                <span className="hud-mailbox__civ-name" style={{ color: '#FF4444' }}>
                                                    {msg.sender}
                                                </span>
                                            </div>
                                            <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#FFAAAA' }}>{msg.subject}</div>
                                            <p className="hud-mailbox__text" style={{ color: '#AAA' }}>{msg.text}</p>
                                        </div>
                                    ))
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
