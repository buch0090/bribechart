/**
 * Calculate streaks and earnings from the log entries for a specific kid.
 */

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getWeekNumber(dateStr) {
  const d = new Date(dateStr);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((d - jan1) / 86400000) + 1;
  return `${d.getFullYear()}-W${Math.ceil(dayOfYear / 7).toString().padStart(2, '0')}`;
}

function getMondayOfWeek(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function calculateProgress(logs, chores, kidName) {
  const today = getToday();
  const currentWeek = getWeekNumber(today);

  // Filter logs for this kid
  const kidLogs = logs.filter(l => l.kid_name === kidName && l.status === 'done');

  const results = chores.map(chore => {
    // Get all completion dates for this chore, sorted
    const completionDates = kidLogs
      .filter(l => l.chore_id === chore.id)
      .map(l => l.date)
      .filter(Boolean)
      .sort();

    // Remove duplicates
    const uniqueDates = [...new Set(completionDates)];

    let currentStreak = 0;
    let totalPayouts = 0;
    let completedToday = false;
    let completedThisWeek = false;

    if (chore.frequency === 'daily') {
      completedToday = uniqueDates.includes(today);

      // Count consecutive days ending at today (or yesterday if not done today)
      currentStreak = 0;
      const checkDate = new Date(today);

      // Walk backwards from today
      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(dateStr)) {
          currentStreak++;
        } else if (i === 0) {
          // Today not done yet, that's ok — check from yesterday
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        } else {
          break;
        }
        checkDate.setDate(checkDate.getDate() - 1);
      }

      // Calculate total payouts: count how many times streak_goal was hit across ALL completions
      totalPayouts = calculateTotalPayouts(uniqueDates, chore, 'daily');
    } else {
      // Weekly
      const completionWeeks = uniqueDates.map(d => getWeekNumber(d));
      const uniqueWeeks = [...new Set(completionWeeks)].sort();

      completedThisWeek = uniqueWeeks.includes(currentWeek);

      // Count consecutive weeks ending at current (or last week)
      currentStreak = 0;
      const checkWeek = new Date(today);
      const checkMonday = getMondayOfWeek(today);
      let weekCursor = new Date(checkMonday);

      for (let i = 0; i < 52; i++) {
        const cursorDate = weekCursor.toISOString().split('T')[0];
        const weekNum = getWeekNumber(cursorDate);
        if (uniqueWeeks.includes(weekNum)) {
          currentStreak++;
        } else if (i === 0) {
          // This week not done yet
          weekCursor.setDate(weekCursor.getDate() - 7);
          continue;
        } else {
          break;
        }
        weekCursor.setDate(weekCursor.getDate() - 7);
      }

      totalPayouts = calculateTotalPayouts(uniqueWeeks, chore, 'weekly');
    }

    const streakGoal = parseInt(chore.streak_goal) || 7;
    const brbeAmount = parseFloat(chore.bribe_amount) || 0;

    // Current streak mod goal (since streaks reset after payout)
    const streakInCurrentCycle = currentStreak % streakGoal;
    // If streak is exactly at goal boundary, show full
    const displayStreak = currentStreak > 0 && streakInCurrentCycle === 0 ? streakGoal : streakInCurrentCycle;

    return {
      chore_id: chore.id,
      title: chore.title,
      description: chore.description,
      emoji: chore.emoji,
      frequency: chore.frequency,
      streak_goal: streakGoal,
      bribe_amount: brbeAmount,
      current_streak: displayStreak,
      total_streak: currentStreak,
      completed_today: completedToday,
      completed_this_week: completedThisWeek,
      total_payouts: totalPayouts,
      total_earned: totalPayouts * brbeAmount,
      just_completed_goal: displayStreak === streakGoal,
    };
  });

  const totalEarned = results.reduce((sum, r) => sum + r.total_earned, 0);

  return { chores: results, totalEarned };
}

function calculateTotalPayouts(sortedEntries, chore, type) {
  const streakGoal = parseInt(chore.streak_goal) || 7;
  if (sortedEntries.length === 0) return 0;

  // Walk through entries counting consecutive runs
  let payouts = 0;
  let streak = 0;

  if (type === 'daily') {
    let prevDate = null;
    for (const dateStr of sortedEntries) {
      if (prevDate) {
        const prev = new Date(prevDate);
        const curr = new Date(dateStr);
        const diffDays = Math.round((curr - prev) / 86400000);
        if (diffDays === 1) {
          streak++;
        } else {
          streak = 1;
        }
      } else {
        streak = 1;
      }
      if (streak >= streakGoal) {
        payouts++;
        streak = 0;
      }
      prevDate = dateStr;
    }
  } else {
    // Weekly — entries are week numbers like "2026-W17"
    let prevWeek = null;
    for (const week of sortedEntries) {
      if (prevWeek) {
        const prevNum = parseInt(prevWeek.split('W')[1]);
        const currNum = parseInt(week.split('W')[1]);
        const prevYear = parseInt(prevWeek.split('-')[0]);
        const currYear = parseInt(week.split('-')[0]);
        if ((currYear === prevYear && currNum === prevNum + 1) ||
            (currYear === prevYear + 1 && prevNum >= 52 && currNum === 1)) {
          streak++;
        } else {
          streak = 1;
        }
      } else {
        streak = 1;
      }
      if (streak >= streakGoal) {
        payouts++;
        streak = 0;
      }
      prevWeek = week;
    }
  }

  return payouts;
}

module.exports = { calculateProgress, getToday };
