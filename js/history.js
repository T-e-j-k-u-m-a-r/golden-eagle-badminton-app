/*  js/history.js
 *  Month-wise & Day-wise history for Players & Admins
 *  Author: 15-year-stack-guru
 */

(() => {
  const gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];

  /* ---------- Helper: groupBy ---------- */
  const groupBy = (arr, keyFn) =>
    arr.reduce((acc, cur) => {
      const key = keyFn(cur);
      (acc[key] = acc[key] || []).push(cur);
      return acc;
    }, {});

  /* ---------- Render helpers ---------- */
  const fmtMonth = dateStr => {
    const [m, d, y] = dateStr.split('/');
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const fmtDay = dateStr => {
    const [m, d, y] = dateStr.split('/');
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const makeTable = games => `
    <table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:6px;border:1px solid #ddd;">Date</th>
          <th style="padding:6px;border:1px solid #ddd;">Start</th>
          <th style="padding:6px;border:1px solid #ddd;">End</th>
          <th style="padding:6px;border:1px solid #ddd;">Duration</th>
          <th style="padding:6px;border:1px solid #ddd;">Players</th>
        </tr>
      </thead>
      <tbody>
        ${games
          .map(
            g => `
          <tr>
            <td style="padding:6px;border:1px solid #ddd;">${g.date}</td>
            <td style="padding:6px;border:1px solid #ddd;">${g.startTime}</td>
            <td style="padding:6px;border:1px solid #ddd;">${g.endTime || '-'}</td>
            <td style="padding:6px;border:1px solid #ddd;">${g.duration || '-'}</td>
            <td style="padding:6px;border:1px solid #ddd;">${g.players.join(', ')}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>`;

  /* ---------- Player History ---------- */
  window.renderPlayerHistory = playerName => {
    const his = gameHistory.filter(g => g.players.includes(playerName));
    if (!his.length) return '<p>No games recorded yet.</p>';

    const byMonth = groupBy(his, g => fmtMonth(g.date));
    return Object.entries(byMonth)
      .map(
        ([month, games]) => `
        <details style="margin-bottom:.8rem;">
          <summary style="font-weight:600;cursor:pointer;">📅 ${month} (${games.length})</summary>
          ${(() => {
            const byDay = groupBy(games, g => fmtDay(g.date));
            return Object.entries(byDay)
              .map(([day, gs]) => `<h4 style="margin:.5rem 0 .2rem;">${day}</h4>${makeTable(gs)}`)
              .join('');
          })()}
        </details>`
      )
      .join('');
  };

  /* ---------- Admin History ---------- */
  window.renderAdminHistory = () => {
    if (!gameHistory.length) return '<p>No batches recorded yet.</p>';

    const byMonth = groupBy(gameHistory, g => fmtMonth(g.date));
    return Object.entries(byMonth)
      .map(
        ([month, games]) => `
        <details style="margin-bottom:.8rem;">
          <summary style="font-weight:600;cursor:pointer;">📅 ${month} (${games.length})</summary>
          ${(() => {
            const byDay = groupBy(games, g => fmtDay(g.date));
            return Object.entries(byDay)
              .map(([day, gs]) => `<h4 style="margin:.5rem 0 .2rem;">${day}</h4>${makeTable(gs)}`)
              .join('');
          })()}
        </details>`
      )
      .join('');
  };
})();