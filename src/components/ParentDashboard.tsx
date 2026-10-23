import { useState } from 'react';
import { useProgress } from '../hooks/useProgress';
import { getNoteById } from '../data/notes';
import { SONGS } from '../data/songs';

interface ParentDashboardProps {
  onBack: () => void;
}

const PIN = '1234';

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ParentDashboard({ onBack }: ParentDashboardProps) {
  const [pinInput, setPinInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const { progress, getFavoriteKey, getWeekSessions, setChildName, clearProgress } = useProgress();

  const handlePin = () => {
    if (pinInput === PIN) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Parent View</h2>
          <p className="text-gray-500 text-sm mb-6">Enter PIN to see your child's progress</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePin()}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-center text-2xl font-black tracking-widest mb-4 focus:outline-none focus:border-purple-500"
            placeholder="••••"
          />
          {pinError && (
            <p className="text-red-500 text-sm mb-3 font-semibold">Wrong PIN. Try again! (hint: 1234)</p>
          )}
          <button
            onClick={handlePin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl transition-colors"
          >
            Unlock
          </button>
          <button
            onClick={onBack}
            className="mt-4 text-gray-400 hover:text-gray-600 text-sm font-semibold"
          >
            ← Back to app
          </button>
        </div>
      </div>
    );
  }

  const weekSessions = getWeekSessions();
  const favoriteKeyId = getFavoriteKey();
  const favoriteNote = favoriteKeyId ? getNoteById(favoriteKeyId) : null;
  const totalWeekTime = weekSessions.reduce((a, s) => a + s.durationSeconds, 0);
  const totalKeys = Object.values(progress.favoriteKeys).reduce((a, b) => a + b, 0);

  // Top 5 favorite keys
  const topKeys = Object.entries(progress.favoriteKeys)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ note: getNoteById(id), count }));

  // Last 7 sessions with dates
  const last7 = weekSessions.slice(-7);

  // Songs
  const songStatus = SONGS.map(s => ({
    song: s,
    attempted: progress.songsAttempted.includes(s.id),
    completed: progress.songsCompleted.includes(s.id),
  }));

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 font-semibold transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-black text-gray-800">Progress Report 📊</h1>
          <div className="w-16" />
        </div>

        {/* Child name */}
        <div className="bg-white rounded-2xl p-5 shadow mb-6">
          <h3 className="font-black text-gray-700 mb-2">👶 Child's Name</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={progress.childName}
              onChange={e => setChildName(e.target.value)}
              placeholder="Enter name (e.g. Anahat)"
              maxLength={30}
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 text-gray-800 font-semibold focus:outline-none focus:border-purple-400"
            />
          </div>
          {progress.childName && (
            <p className="text-gray-500 text-sm mt-2">
              Showing progress for <strong>{progress.childName}</strong> 🌟
            </p>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow text-center">
            <div className="text-3xl font-black text-purple-600">{totalKeys}</div>
            <div className="text-gray-500 text-xs font-semibold mt-1">Keys Pressed</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow text-center">
            <div className="text-3xl font-black text-green-600">{progress.songsCompleted.length}</div>
            <div className="text-gray-500 text-xs font-semibold mt-1">Songs Completed</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow text-center">
            <div className="text-3xl font-black text-blue-600">{progress.glowRoundsCompleted}</div>
            <div className="text-gray-500 text-xs font-semibold mt-1">Glow Rounds</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow text-center">
            <div className="text-3xl font-black text-orange-600">{formatTime(totalWeekTime)}</div>
            <div className="text-gray-500 text-xs font-semibold mt-1">This Week</div>
          </div>
        </div>

        {/* Favorite key */}
        {favoriteNote && (
          <div className="bg-white rounded-2xl p-5 shadow mb-5">
            <h3 className="font-black text-gray-700 mb-2">🌟 Favorite Key</h3>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow"
                style={{ backgroundColor: favoriteNote.color }}
              >
                {favoriteNote.animal}
              </div>
              <div>
                <div className="text-xl font-black text-gray-800">{favoriteNote.animalName}</div>
                <div className="text-gray-500 text-sm">
                  Note: {favoriteNote.displayName} · Pressed {progress.favoriteKeys[favoriteKeyId!]} times
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top keys played */}
        {topKeys.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow mb-5">
            <h3 className="font-black text-gray-700 mb-3">🎹 Most Played Keys</h3>
            <div className="space-y-2">
              {topKeys.map(({ note, count }) => note && (
                <div key={note.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: note.color }}
                  >
                    {note.animal}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-semibold text-gray-700">
                      <span>{note.animalName} ({note.displayName})</span>
                      <span>{count}×</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full bg-purple-500 transition-all"
                        style={{ width: `${(count / (topKeys[0]?.count ?? 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Song progress */}
        <div className="bg-white rounded-2xl p-5 shadow mb-5">
          <h3 className="font-black text-gray-700 mb-3">🎵 Songs</h3>
          <div className="space-y-2">
            {songStatus.map(({ song, attempted, completed }) => (
              <div key={song.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-2xl">{song.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm">{song.name}</div>
                  <div className="text-gray-400 text-xs">{song.description}</div>
                </div>
                <div className="text-sm font-black">
                  {completed ? (
                    <span className="text-green-500">✅ Done!</span>
                  ) : attempted ? (
                    <span className="text-yellow-500">🌟 Trying</span>
                  ) : (
                    <span className="text-gray-300">Not yet</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent sessions */}
        {last7.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow mb-5">
            <h3 className="font-black text-gray-700 mb-3">📅 Recent Sessions (This Week)</h3>
            <div className="space-y-2">
              {last7.map((session, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="text-lg">
                    {session.mode === 'rainbow' ? '🌈' : session.mode === 'glow' ? '⭐' : '🎵'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-700 capitalize">{session.mode} Play</div>
                    <div className="text-gray-400 text-xs">{formatDate(session.date)}</div>
                  </div>
                  <div className="text-sm font-black text-gray-600">
                    {formatTime(session.durationSeconds)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {(() => {
          const n = progress.childName || 'Your child';
          const she = progress.childName ? progress.childName : 'She';
          return (
            <div className="bg-linear-to-r from-purple-100 to-pink-100 rounded-2xl p-5 shadow mb-5">
              <h3 className="font-black text-gray-700 mb-3">💡 Insights for You</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {progress.sessions.length === 0 && (
                  <li>🎹 No sessions yet — start playing to see insights!</li>
                )}
                {totalKeys > 0 && totalKeys <= 20 && (
                  <li>🌱 {she} is just getting started — {totalKeys} key presses so far. Keep encouraging exploration!</li>
                )}
                {totalKeys > 20 && totalKeys <= 100 && (
                  <li>🌟 {she} is getting into it — {totalKeys} key presses total. Great progress!</li>
                )}
                {totalKeys > 100 && (
                  <li>✨ {she} has been very active — {totalKeys} key presses total! Strong engagement.</li>
                )}
                {progress.glowRoundsCompleted >= 1 && progress.glowRoundsCompleted < 3 && (
                  <li>⭐ {she} has completed {progress.glowRoundsCompleted} "Follow the Glow" round{progress.glowRoundsCompleted > 1 ? 's' : ''} — this builds note recognition!</li>
                )}
                {progress.glowRoundsCompleted >= 3 && (
                  <li>🌟 {she} has completed {progress.glowRoundsCompleted} "Follow the Glow" rounds — excellent for note memory!</li>
                )}
                {progress.songsCompleted.length > 0 && (
                  <li>🎵 {she} has finished {progress.songsCompleted.length} song(s): <strong>{progress.songsCompleted.map(id => SONGS.find(s => s.id === id)?.name).filter(Boolean).join(', ')}</strong></li>
                )}
                {favoriteNote && (
                  <li>🐾 Favorite key: {favoriteNote.displayName} ({favoriteNote.animalName} {favoriteNote.animal}) — a great anchor note for {n} to build from!</li>
                )}
                {totalWeekTime > 60 && totalWeekTime <= 300 && (
                  <li>⏱ {she} played {formatTime(totalWeekTime)} this week — great start for a young learner!</li>
                )}
                {totalWeekTime > 300 && (
                  <li>⏱ {she} played {formatTime(totalWeekTime)} this week — excellent consistency! Regularity helps retention.</li>
                )}
                {progress.sessions.length >= 3 && (
                  <li>📅 {she} has had {progress.sessions.length} total practice sessions — the repetition is building real habits!</li>
                )}
              </ul>
            </div>
          );
        })()}

        {/* Keyboard setup guide */}
        <div className="bg-blue-50 rounded-2xl p-5 shadow mb-5 border border-blue-100">
          <h3 className="font-black text-blue-700 mb-2">🎹 Connect the Casio Keyboard</h3>
          <p className="text-gray-600 text-sm mb-3">
            Plug your Casio CTK-515 (or any USB MIDI keyboard) into this device to let your child play on the real keys!
          </p>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Connect the keyboard via USB cable</li>
            <li>Open this app in <strong>Chrome</strong> (required for MIDI)</li>
            <li>When prompted, click <strong>"Allow"</strong> for MIDI access</li>
            <li>The green "Keyboard connected!" badge will appear in each game</li>
          </ol>
          <p className="text-gray-400 text-xs mt-3">
            Note: Web MIDI works in Chrome and Edge. Safari/Firefox not supported.
          </p>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl p-5 shadow mb-5 border border-red-100">
          <h3 className="font-black text-red-700 mb-2">⚠️ Reset Progress</h3>
          <p className="text-gray-500 text-sm mb-3">This will erase all saved data. Cannot be undone.</p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure? This will erase all progress data.')) {
                clearProgress();
              }
            }}
            className="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            Clear All Progress
          </button>
        </div>

        <p className="text-center text-gray-400 text-xs mb-4">
          Data stored locally on this device only. PIN: 1234 (change in code)
        </p>
      </div>
    </div>
  );
}
