import React, { useEffect, useState } from 'react';
import styles from './WinnerAnnouncer.module.css';

const WinnerAnnouncer = ({ winner, winnerName, rank, onAcknowledge }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (winner) {
            setVisible(true);
        }
    }, [winner]);

    if (!winner || !visible) {
        return null;
    }

    return (
        <div className={styles.announcerOverlay}>
            <div className={styles.announcerBox}>
                <h2>Player Finished!</h2>
                <p>
                    <span className={`${styles.winnerName} ${styles[winner]}`}>{winnerName}</span> has finished in position #{rank}!
                </p>
                <button onClick={onAcknowledge} className={styles.continueButton}>Continue</button>
            </div>
        </div>
    );
};

export default WinnerAnnouncer;