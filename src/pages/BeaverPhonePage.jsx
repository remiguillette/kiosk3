import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, PhoneOff } from 'lucide-react';
import '../styles/beaverphone.css';

const DIALPAD_DEFINITION = [
  { label: '1' },
  { label: '2', subtext: 'ABC' },
  { label: '3', subtext: 'DEF' },
  { label: '4', subtext: 'GHI' },
  { label: '5', subtext: 'JKL' },
  { label: '6', subtext: 'MNO' },
  { label: '7', subtext: 'PQRS' },
  { label: '8', subtext: 'TUV' },
  { label: '9', subtext: 'WXYZ' },
  { label: '*' },
  { label: '0', subtext: '+' },
  { label: '#' }
];

const CONTACTS = [
  {
    name: 'Ontario Provincial Police',
    subtitle: 'Internal line',
    details: 'Office 101',
    extension: '1201',
    image: '/contact/police.svg'
  },
  {
    name: 'SPCA Niagara',
    subtitle: 'Paws Law',
    details: 'Office 3434',
    extension: '3434',
    image: '/contact/spca.svg'
  },
  {
    name: 'Mom',
    subtitle: 'Mom',
    details: 'Complaints Office',
    extension: '22',
    image: null
  },
  {
    name: 'Services Ontario',
    subtitle: 'Government of Ontario',
    details: 'Desktop *1345',
    extension: '1345',
    image: '/contact/ontario.svg'
  }
];

const INITIAL_STATE = {
  dialedNumber: '',
  isOnCall: false,
  isOnHold: false,
  isSpeakerEnabled: false
};

function dispatchDialpadEvent(number) {
  const event = new CustomEvent('beaverphone:dialpad', {
    detail: { number }
  });
  window.dispatchEvent(event);
}

function BeaverPhonePage() {
  const [state, setState] = useState(INITIAL_STATE);
  const inputRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState('Ready to dial');

  const callButtonLabel = state.isOnCall ? 'Hang up' : 'Call';
  const holdButtonLabel = state.isOnHold ? 'Resume' : 'Hold';
  const speakerButtonLabel = state.isSpeakerEnabled ? 'Speaker on' : 'Speaker';

  const helperText = useMemo(() => {
    if (!state.dialedNumber) {
      return 'Dial a number or choose a saved extension to get started.';
    }

    if (state.dialedNumber.length < 3) {
      return 'Add a few more digits, then press Call to connect.';
    }

    return 'Press Call to start the connection or choose an action below.';
  }, [state.dialedNumber]);

  const statusLabel = state.isOnCall ? (state.isOnHold ? 'On hold' : 'In call') : 'Idle';

  function appendDigit(digit) {
    setState((prev) => {
      const nextNumber = `${prev.dialedNumber}${digit}`.slice(0, 18);
      dispatchDialpadEvent(digit);
      return { ...prev, dialedNumber: nextNumber };
    });
  }

  function eraseDigit() {
    setState((prev) => ({ ...prev, dialedNumber: prev.dialedNumber.slice(0, -1) }));
  }

  function resetDialer() {
    setState((prev) => ({ ...INITIAL_STATE, isSpeakerEnabled: prev.isSpeakerEnabled }));
  }

  function toggleCall() {
    setState((prev) => ({
      ...prev,
      isOnCall: !prev.isOnCall,
      isOnHold: prev.isOnCall ? false : prev.isOnHold
    }));
  }

  function toggleHold() {
    setState((prev) => ({ ...prev, isOnHold: !prev.isOnHold }));
  }

  function toggleSpeaker() {
    setState((prev) => ({ ...prev, isSpeakerEnabled: !prev.isSpeakerEnabled }));
  }

  function handleComposerChange(event) {
    const { value } = event.target;
    const sanitized = value.replace(/[^0-9*#]/g, '');
    setState((prev) => {
      const nextState = { ...prev, dialedNumber: sanitized };
      if (sanitized.length > prev.dialedNumber.length) {
        const newDigit = sanitized.slice(-1);
        if (newDigit) {
          dispatchDialpadEvent(newDigit);
        }
      }
      return nextState;
    });
  }

  function handleComposerKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      toggleCall();
    }
    if (event.key === 'Backspace' && !state.dialedNumber) {
      event.preventDefault();
      resetDialer();
    }
  }

  function handleContactSelect(contact) {
    setState((prev) => ({ ...prev, dialedNumber: contact.extension }));
    for (const digit of contact.extension.split('')) {
      dispatchDialpadEvent(digit);
    }
    setStatusMessage(`Dialing ${contact.name} (${contact.extension})`);
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    document.title = 'BeaverPhone';

    const removeListener = window.beaverphone?.onMessage?.((message) => {
      setStatusMessage(message);
    });

    return () => {
      if (removeListener) {
        removeListener();
      }
    };
  }, []);

  useEffect(() => {
    setStatusMessage(state.isOnCall ? 'Call connected' : 'Ready to dial');
  }, [state.isOnCall]);

  return (
    <div className="beaverphone-page">
      <div className="beaverphone">
        <header className="bp-header">
          <Link className="menu-return" to="/" aria-label="Return to menu">
            ← Menu
          </Link>
          <span className="eyebrow">BeaverPhone</span>
          <span className="status-pill" data-active={String(state.isOnCall)}>
            {statusLabel}
          </span>
        </header>

        <div className="bp-grid">
          <section className="dialpad-panel" aria-labelledby="dialpad-heading">
            <div className="panel-header">
              <h2 id="dialpad-heading">Dialpad</h2>
              <p className="panel-subtitle">Tap a digit or type on the keyboard.</p>
            </div>

            <div className="composer">
              <label htmlFor="composer-input">Number</label>
              <input
                id="composer-input"
                ref={inputRef}
                placeholder="Enter number"
                value={state.dialedNumber}
                onChange={handleComposerChange}
                onKeyDown={handleComposerKeyDown}
              />
              <p className="composer-helper">{helperText}</p>
            </div>

            <div className="dialpad-grid">
              {DIALPAD_DEFINITION.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="dialpad-key"
                  onClick={() => appendDigit(item.label)}
                  aria-label={item.subtext ? `${item.label} ${item.subtext}` : item.label}
                >
                  <span>{item.label}</span>
                  {item.subtext ? <small>{item.subtext}</small> : null}
                </button>
              ))}
            </div>

            <div className="dialpad-actions">
              <button type="button" className="pill-btn" onClick={eraseDigit}>
                ⌫ Erase
              </button>
              <button
                type="button"
                className="pill-btn call-btn"
                onClick={toggleCall}
                data-active={String(state.isOnCall)}
                aria-pressed={String(state.isOnCall)}
              >
                <span className="btn-icon" aria-hidden="true">
                  {state.isOnCall ? <PhoneOff size={20} /> : <Phone size={20} />}
                </span>
                {callButtonLabel}
              </button>
              <button
                type="button"
                className="pill-btn"
                onClick={toggleSpeaker}
                data-active={String(state.isSpeakerEnabled)}
              >
                🔈 {speakerButtonLabel}
              </button>
            </div>

            <div className="dialpad-actions secondary">
              <button
                type="button"
                className="pill-btn"
                onClick={toggleHold}
                disabled={!state.isOnCall}
                data-active={String(state.isOnHold)}
              >
                ⏸ {holdButtonLabel}
              </button>
              <button type="button" className="pill-btn" onClick={resetDialer}>
                ✖ Clear
              </button>
            </div>

            <p className="status-message" role="status">
              {statusMessage}
            </p>
          </section>

          <section className="extensions" aria-labelledby="extensions-heading">
            <header className="panel-header">
              <h2 id="extensions-heading">Saved extensions</h2>
              <p className="panel-subtitle">Quick access to your most important contacts.</p>
            </header>
            <ul className="extension-list">
              {CONTACTS.map((contact) => (
                <li key={contact.extension}>
                  <button type="button" className="extension-card" onClick={() => handleContactSelect(contact)}>
                    {contact.image ? (
                      <img src={contact.image} alt="" aria-hidden="true" />
                    ) : (
                      <span className="extension-fallback" aria-hidden="true">
                        {contact.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <strong>{contact.name}</strong>
                      <span>{contact.subtitle}</span>
                      <span className="details">{contact.details}</span>
                    </div>
                    <span className="extension">{contact.extension}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default BeaverPhonePage;
