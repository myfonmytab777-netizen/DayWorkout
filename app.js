const cleanRepsText = (reps) => reps ? reps.replace(/^\d+\s*Set\s*x\s*/i, '') : '';

const DEFAULT_TEMPLATES = [
    {
        id: 'tpl_chest',
        name: 'DADA',
        emoji: '🔥',
        activities: [
            { id: 'act_c1', name: 'Push Up Standard', reps: '15 Reps' },
            { id: 'act_c2', name: 'Wide Push Up', reps: '12 Reps' },
            { id: 'act_c3', name: 'Incline Push Up', reps: '12 Reps' },
            { id: 'act_c4', name: 'Dips / Diamond Push Up', reps: '10 Reps' }
        ]
    },
    {
        id: 'tpl_abs',
        name: 'PERUT',
        emoji: '🍉',
        activities: [
            { id: 'act_a1', name: 'Crunches', reps: '20 Reps' },
            { id: 'act_a2', name: 'Leg Raises', reps: '15 Reps' },
            { id: 'act_a3', name: 'Plank Hold', reps: '45 Saat' },
            { id: 'act_a4', name: 'Russian Twists', reps: '20 Reps' }
        ]
    },
    {
        id: 'tpl_legs',
        name: 'LEG DAY',
        emoji: '🥥',
        activities: [
            { id: 'act_l1', name: 'Bodyweight Squats', reps: '20 Reps' },
            { id: 'act_l2', name: 'Lunges Walk', reps: '12 Reps' },
            { id: 'act_l3', name: 'Calf Raises', reps: '25 Reps' },
            { id: 'act_l4', name: 'Wall Sit', reps: '45 Saat' }
        ]
    }
];

const POPULAR_EMOJIS = [
    '⭐', '🌟', '✨', '💫', '🔥', '💪', '🏋️', '🏃', 
    '🎯', '🏆', '🥇', '⚡', '🚀', '📈', '✅', '🛡️', 
    '🧠', '💧', '😴', '🥗', '🎧', '🌱', '👑', '🎖️'
];

const STAR_PRESETS = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '🌟', '✨', '💫'];

const INITIAL_WEEKS = [
    {
        id: 'week_1',
        title: 'MINGGU 1 — 1 SET',
        stars: '⭐',
        days: [
            { id: 'w1_d1', dayName: 'ISNIN', focusName: 'DADA', emoji: '🔥', focusTemplateIds: ['tpl_chest'], isRest: false },
            { id: 'w1_d2', dayName: 'SELASA', focusName: 'PERUT', emoji: '🍉', focusTemplateIds: ['tpl_abs'], isRest: false },
            { id: 'w1_d3', dayName: 'RABU', focusName: 'DADA', emoji: '🔥', focusTemplateIds: ['tpl_chest'], isRest: false },
            { id: 'w1_d4', dayName: 'KHAMIS', focusName: 'PERUT', emoji: '🍉', focusTemplateIds: ['tpl_abs'], isRest: false },
            { id: 'w1_d5', dayName: 'JUMAAT', focusName: 'DADA', emoji: '🔥', focusTemplateIds: ['tpl_chest'], isRest: false },
            { id: 'w1_d6', dayName: 'SABTU', focusName: 'LEG DAY', emoji: '🥥', focusTemplateIds: ['tpl_legs'], isRest: false },
            { id: 'w1_d7', dayName: 'AHAD', focusName: 'REST', emoji: '😴', focusTemplateIds: [], isRest: true }
        ]
    }
];

function App() {
    const [templates, setTemplates] = React.useState(() => {
        const saved = localStorage.getItem('workout_templates_v3');
        if (saved) {
            try { return JSON.parse(saved); } catch(e) { console.error(e); }
        }
        return DEFAULT_TEMPLATES;
    });

    const [weeks, setWeeks] = React.useState(() => {
        const saved = localStorage.getItem('workout_weeks_v3');
        if (saved) {
            try { return JSON.parse(saved); } catch(e) { console.error(e); }
        }
        return INITIAL_WEEKS;
    });

    const [checkedState, setCheckedState] = React.useState(() => {
        const saved = localStorage.getItem('workout_checked_state_v3');
        if (saved) {
            try { return JSON.parse(saved); } catch(e) { console.error(e); }
        }
        return {};
    });

    const [collapsedDays, setCollapsedDays] = React.useState({});
    const [currentView, setCurrentView] = React.useState('notes');
    const [activeDayModal, setActiveDayModal] = React.useState(null);
    const [activeTemplateModal, setActiveTemplateModal] = React.useState(null);
    const [activeWeekModal, setActiveWeekModal] = React.useState(null);
    const [confirmDeleteModal, setConfirmDeleteModal] = React.useState(null);

    const [showDayEmojiPicker, setShowDayEmojiPicker] = React.useState(false);
    const [showTplEmojiPicker, setShowTplEmojiPicker] = React.useState(false);
    const [showWeekEmojiPicker, setShowWeekEmojiPicker] = React.useState(false);

    React.useEffect(() => {
        localStorage.setItem('workout_templates_v3', JSON.stringify(templates));
    }, [templates]);

    React.useEffect(() => {
        localStorage.setItem('workout_weeks_v3', JSON.stringify(weeks));
    }, [weeks]);

    React.useEffect(() => {
        localStorage.setItem('workout_checked_state_v3', JSON.stringify(checkedState));
    }, [checkedState]);

    const toggleCheck = (weekId, dayId, templateId, activityId) => {
        const key = `${weekId}_${dayId}_${templateId}_${activityId}`;
        setCheckedState(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const toggleBukakTutup = (weekId, dayId) => {
        const key = `${weekId}_${dayId}`;
        setCollapsedDays(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const isDayCompleted = (weekId, day) => {
        if (day.isRest) return true;
        let total = 0;
        let done = 0;

        day.focusTemplateIds.forEach(tplId => {
            const tpl = templates.find(t => t.id === tplId);
            if (tpl) {
                tpl.activities.forEach(act => {
                    total++;
                    if (checkedState[`${weekId}_${day.id}_${tplId}_${act.id}`]) {
                        done++;
                    }
                });
            }
        });

        return total > 0 && total === done;
    };

    const toggleAllInDay = (weekId, day) => {
        const currentlyCompleted = isDayCompleted(weekId, day);
        const newChecked = { ...checkedState };

        day.focusTemplateIds.forEach(tplId => {
            const tpl = templates.find(t => t.id === tplId);
            if (tpl) {
                tpl.activities.forEach(act => {
                    const key = `${weekId}_${day.id}_${tplId}_${act.id}`;
                    newChecked[key] = !currentlyCompleted;
                });
            }
        });

        setCheckedState(newChecked);
    };

    const handleUpdateDay = (updatedDay) => {
        setWeeks(prevWeeks => prevWeeks.map(w => {
            if (w.id !== activeDayModal.weekId) return w;
            return {
                ...w,
                days: w.days.map(d => d.id === updatedDay.id ? updatedDay : d)
            };
        }));
        setActiveDayModal(null);
        setShowDayEmojiPicker(false);
    };

    const handleUpdateWeek = (updatedWeek) => {
        setWeeks(prevWeeks => prevWeeks.map(w => w.id === updatedWeek.id ? updatedWeek : w));
        setActiveWeekModal(null);
        setShowWeekEmojiPicker(false);
    };

    const handleDeleteWeek = (weekId) => {
        setWeeks(prevWeeks => prevWeeks.filter(w => w.id !== weekId));
        if (activeWeekModal && activeWeekModal.id === weekId) {
            setActiveWeekModal(null);
        }
    };

    const handleDeleteActivity = (templateId, activityId) => {
        setTemplates(prev => prev.map(t => {
            if (t.id !== templateId) return t;
            return {
                ...t,
                activities: t.activities.filter(a => a.id !== activityId)
            };
        }));
    };

    const handleDeleteTemplate = (templateId) => {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        setWeeks(prevWeeks => prevWeeks.map(w => ({
            ...w,
            days: w.days.map(d => ({
                ...d,
                focusTemplateIds: d.focusTemplateIds ? d.focusTemplateIds.filter(id => id !== templateId) : []
            }))
        })));
        if (activeTemplateModal && activeTemplateModal.id === templateId) {
            setActiveTemplateModal(null);
        }
    };

    const handleAddWeek = () => {
        const newWeekNum = weeks.length + 1;
        const starStr = '⭐'.repeat(Math.min(newWeekNum, 5));
        const newWeek = {
            id: `week_${Date.now()}`,
            title: `MINGGU ${newWeekNum} — ${newWeekNum} SET`,
            stars: starStr,
            days: [
                { id: `w${newWeekNum}_d1`, dayName: 'ISNIN', focusName: 'DADA', emoji: '🔥', focusTemplateIds: ['tpl_chest'], isRest: false },
                { id: `w${newWeekNum}_d2`, dayName: 'SELASA', focusName: 'PERUT', emoji: '🍉', focusTemplateIds: ['tpl_abs'], isRest: false },
                { id: `w${newWeekNum}_d3`, dayName: 'RABU', focusName: 'DADA', emoji: '🔥', focusTemplateIds: ['tpl_chest'], isRest: false },
                { id: `w${newWeekNum}_d4`, dayName: 'KHAMIS', focusName: 'PERUT', emoji: '🍉', focusTemplateIds: ['tpl_abs'], isRest: false },
                { id: `w${newWeekNum}_d5`, dayName: 'JUMAAT', focusName: 'DADA', emoji: '🔥', focusTemplateIds: ['tpl_chest'], isRest: false },
                { id: `w${newWeekNum}_d6`, dayName: 'SABTU', focusName: 'LEG DAY', emoji: '🥥', focusTemplateIds: ['tpl_legs'], isRest: false },
                { id: `w${newWeekNum}_d7`, dayName: 'AHAD', focusName: 'REST', emoji: '😴', focusTemplateIds: [], isRest: true }
            ]
        };
        setWeeks([...weeks, newWeek]);
    };

    const handleHapusSemuaTicks = () => {
        setCheckedState({});
        setConfirmDeleteModal(null);
    };

    const handleHapusSemuaSampel = () => {
        setTemplates([]);
        setWeeks([]);
        setCheckedState({});
        setCollapsedDays({});
        localStorage.clear();
        setConfirmDeleteModal(null);
    };

    const handleHapusKeseluruhanData = () => {
        setTemplates(DEFAULT_TEMPLATES);
        setWeeks(INITIAL_WEEKS);
        setCheckedState({});
        setCollapsedDays({});
        localStorage.clear();
        setConfirmDeleteModal(null);
    };

    const getOverallStats = () => {
        let total = 0;
        let completed = 0;

        weeks.forEach(w => {
            w.days.forEach(d => {
                if (!d.isRest) {
                    d.focusTemplateIds.forEach(tplId => {
                        const tpl = templates.find(t => t.id === tplId);
                        if (tpl) {
                            tpl.activities.forEach(act => {
                                total++;
                                if (checkedState[`${w.id}_${d.id}_${tplId}_${act.id}`]) {
                                    completed++;
                                }
                            });
                        }
                    });
                }
            });
        });

        return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    const stats = getOverallStats();

    const getRankTitle = (percent) => {
        if (percent >= 80) return '⚡ STREAK MASTER';
        if (percent >= 50) return '⚡ WORKOUT WARRIOR';
        if (percent >= 20) return '⚡ APPRENTICE';
        return '⚡ BEGINNER';
    };

    return (
        <div className="max-w-md mx-auto min-h-screen pb-24 bg-black relative selection:bg-amber-500">
            {/* TOP HEADER */}
            <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/70 via-orange-500/80 to-yellow-400/70 rounded-2xl blur-md animate-pulse opacity-90"></div>
                        <div className="absolute -inset-3 bg-amber-500/20 rounded-full blur-xl animate-pulse"></div>

                        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 p-0.5 flex items-center justify-center animate-aura-glow cursor-pointer ambient-glow">
                            <div className="w-full h-full bg-gradient-to-br from-amber-500/90 to-orange-600 rounded-[14px] flex items-center justify-center">
                                <span className="text-xl animate-flame-flicker select-none">🔥</span>
                            </div>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 border-2 border-black rounded-full shadow-sm z-10"></span>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center space-x-1.5">
                            <span className="text-white font-extrabold text-lg tracking-wide uppercase">AURA</span>
                            <span className="px-1.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/80 rounded-md bg-amber-500/10 tracking-widest uppercase">
                                PRO
                            </span>
                        </div>
                        <div className="text-[10px] font-bold text-amber-400/90 tracking-wider flex items-center gap-1 uppercase">
                            <span>{getRankTitle(stats.percent)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setCurrentView(currentView === 'notes' ? 'templates' : 'notes')}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            currentView === 'templates' 
                                ? 'bg-amber-500 text-black font-bold' 
                                : 'bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700'
                        }`}
                    >
                        <i className={`fa-solid ${currentView === 'notes' ? 'fa-sliders' : 'fa-list-check'}`}></i>
                        {currentView === 'notes' ? 'Sesi Fokus' : 'Lihat Notes'}
                    </button>

                    <button 
                        onClick={() => setConfirmDeleteModal('menu')}
                        title="Hapus & Reset"
                        className="p-2 text-zinc-400 hover:text-red-400 transition-colors text-sm rounded-lg bg-zinc-900 border border-zinc-800"
                    >
                        <i className="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </header>

            {/* Progress Banner */}
            <div className="px-4 pt-3 pb-1 bg-gradient-to-b from-zinc-900/60 to-transparent">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
                    <span>KEMAJUAN KESELURUHAN</span>
                    <span className="text-amber-400 font-bold">{stats.completed} / {stats.total} ({stats.percent}%)</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-2">
                    <div 
                        className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${stats.percent}%` }}
                    ></div>
                </div>
            </div>

            {/* NOTES MAIN VIEW */}
            {currentView === 'notes' && (
                <main className="px-4 py-3 space-y-8">
                    {weeks.length === 0 ? (
                        <div className="py-12 text-center space-y-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6">
                            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-3xl flex items-center justify-center mx-auto">
                                📋
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-200 text-base">Tiada Jadual Minggu</h3>
                                <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">
                                    Semua minggu telah dipadamkan. Tekan butang di bawah untuk menambah minggu latihan baharu.
                                </p>
                            </div>
                            <button 
                                onClick={handleAddWeek}
                                className="py-2.5 px-5 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-all shadow-lg inline-flex items-center gap-2"
                            >
                                <i className="fa-solid fa-plus"></i> Tambah Minggu Baru
                            </button>
                        </div>
                    ) : (
                        weeks.map((week) => (
                            <section key={week.id} className="space-y-4 border border-zinc-900/80 rounded-2xl p-4 bg-zinc-950/40">
                                {/* WEEK HEADER */}
                                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-amber-400 font-extrabold text-sm sm:text-base tracking-wide">{week.title}</span>
                                        <span className="text-xs">{week.stars}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => setActiveWeekModal(week)}
                                            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-800 flex items-center gap-1 transition-all"
                                        >
                                            <i className="fa-solid fa-pen text-amber-500 text-[10px]"></i>
                                            <span>Tetapan</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteWeek(week.id)}
                                            title="Padam Minggu Ini"
                                            className="px-2 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-400 text-xs rounded-lg border border-red-800/60 transition-all active:scale-95"
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* DAYS LIST */}
                                <div className="space-y-3">
                                    {week.days.map((day) => {
                                        const isCollapsed = collapsedDays[`${week.id}_${day.id}`];
                                        const dayComplete = isDayCompleted(week.id, day);

                                        return (
                                            <div 
                                                key={day.id} 
                                                className={`border rounded-xl transition-all ${
                                                    day.isRest 
                                                        ? 'bg-zinc-900/20 border-zinc-900/60 opacity-75' 
                                                        : dayComplete 
                                                            ? 'bg-amber-950/10 border-amber-500/30 glow-amber' 
                                                            : 'bg-zinc-900/40 border-zinc-800/80'
                                                }`}
                                            >
                                                {/* DAY CARD HEADER */}
                                                <div className="p-3 flex items-center justify-between">
                                                    <div className="flex items-center space-x-2.5">
                                                        <span className="text-lg">{day.emoji}</span>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <h4 className="font-bold text-xs uppercase tracking-wider text-white">{day.dayName}</h4>
                                                                <span className="text-zinc-500 font-mono text-[10px]">—</span>
                                                                <span className="text-amber-400/90 text-xs font-semibold">{day.focusName}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        {!day.isRest && (
                                                            <button 
                                                                onClick={() => toggleAllInDay(week.id, day)}
                                                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${
                                                                    dayComplete 
                                                                        ? 'bg-amber-500 text-black border-amber-400' 
                                                                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                                                }`}
                                                            >
                                                                {dayComplete ? '✓ Selesai' : 'Tandakan Semua'}
                                                            </button>
                                                        )}

                                                        <button 
                                                            onClick={() => toggleBukakTutup(week.id, day.id)}
                                                            className="text-zinc-400 hover:text-white px-2 py-1 text-xs"
                                                            title={isCollapsed ? 'Buka' : 'Tutup'}
                                                        >
                                                            <i className={`fa-solid fa-chevron-${isCollapsed ? 'down' : 'up'}`}></i>
                                                        </button>

                                                        <button 
                                                            onClick={() => setActiveDayModal({ weekId: week.id, ...day })}
                                                            className="p-1.5 text-zinc-400 hover:text-amber-400 rounded-lg hover:bg-zinc-800/60 transition-colors"
                                                            title="Sunting Hari"
                                                        >
                                                            <i className="fa-solid fa-pen text-xs"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* DAY ACTIVITIES CONTENT */}
                                                {!isCollapsed && !day.isRest && (
                                                    <div className="px-3 pb-3 pt-1 border-t border-zinc-800/50 space-y-2">
                                                        {day.focusTemplateIds.map(tplId => {
                                                            const tpl = templates.find(t => t.id === tplId);
                                                            if (!tpl) return null;

                                                            return (
                                                                <div key={tplId} className="space-y-1.5 pt-1">
                                                                    <div className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                                                                        <span>{tpl.emoji}</span>
                                                                        <span>{tpl.name}</span>
                                                                    </div>
                                                                    <div className="space-y-1.5 pl-1">
                                                                        {tpl.activities.map(act => {
                                                                            const isChecked = checkedState[`${week.id}_${day.id}_${tplId}_${act.id}`];

                                                                            return (
                                                                                <div 
                                                                                    key={act.id}
                                                                                    onClick={() => toggleCheck(week.id, day.id, tplId, act.id)}
                                                                                    className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                                                                                        isChecked 
                                                                                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' 
                                                                                            : 'bg-black/30 border-zinc-800/70 hover:border-zinc-700 text-zinc-300'
                                                                                    }`}
                                                                                >
                                                                                    <div className="flex items-center space-x-3">
                                                                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center check-anim ${
                                                                                            isChecked 
                                                                                                ? 'bg-amber-500 border-amber-400 text-black' 
                                                                                                : 'border-zinc-700 bg-zinc-900'
                                                                                        }`}>
                                                                                            {isChecked && <i className="fa-solid fa-check text-[10px] font-black"></i>}
                                                                                        </div>
                                                                                        <span className={`text-xs font-medium ${isChecked ? 'line-through text-zinc-400' : ''}`}>
                                                                                            {act.name}
                                                                                        </span>
                                                                                    </div>
                                                                                    <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">
                                                                                        {cleanRepsText(act.reps)}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {!isCollapsed && day.isRest && (
                                                    <div className="px-3 pb-3 pt-1 border-t border-zinc-800/50 text-center py-4 text-zinc-500 text-xs italic">
                                                        Hari Rehat & Pemulihan Otot 🛌
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))
                    )}

                    <div className="pt-2 pb-6">
                        <button 
                            onClick={handleAddWeek}
                            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                            <i className="fa-solid fa-plus text-amber-400"></i> Tambah Minggu Latihan Baru
                        </button>
                    </div>
                </main>
            )}

            {/* TEMPLATES & EXERCISE MANAGEMENT VIEW */}
            {currentView === 'templates' && (
                <main className="px-4 py-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-extrabold text-white tracking-wide">PENGURUSAN SESI FOKUS</h2>
                            <p className="text-xs text-zinc-400">Tambah atau ubah senaman dan rutin latihan.</p>
                        </div>
                        <button 
                            onClick={() => setActiveTemplateModal({ id: `tpl_${Date.now()}`, name: 'FOKUS BARU', emoji: '💪', activities: [] })}
                            className="px-3 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-all flex items-center gap-1.5"
                        >
                            <i className="fa-solid fa-plus"></i> Sesi Baru
                        </button>
                    </div>

                    <div className="space-y-4">
                        {templates.map(tpl => (
                            <div key={tpl.id} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xl">{tpl.emoji}</span>
                                        <span className="font-bold text-sm text-white tracking-wide">{tpl.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => setActiveTemplateModal(tpl)}
                                            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-800 flex items-center gap-1"
                                        >
                                            <i className="fa-solid fa-pen text-amber-500 text-[10px]"></i> Sunting
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteTemplate(tpl.id)}
                                            className="px-2 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-400 text-xs rounded-lg border border-red-800/60"
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    {tpl.activities.map(act => (
                                        <div key={act.id} className="flex items-center justify-between p-2 bg-black/40 border border-zinc-900 rounded-xl text-xs">
                                            <span className="text-zinc-300 font-medium">{act.name}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-zinc-400">{cleanRepsText(act.reps)}</span>
                                                <button 
                                                    onClick={() => handleDeleteActivity(tpl.id, act.id)}
                                                    className="text-zinc-600 hover:text-red-400 p-1"
                                                >
                                                    <i className="fa-solid fa-xmark text-[10px]"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            )}

            {/* MODAL: SUNTING HARI */}
            {activeDayModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <h3 className="font-bold text-white text-sm tracking-wide">Tetapan Hari: {activeDayModal.dayName}</h3>
                            <button onClick={() => setActiveDayModal(null)} className="text-zinc-400 hover:text-white p-1">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-mono text-zinc-400 mb-1">NAMA FOKUS HARI INI</label>
                                <input 
                                    type="text" 
                                    value={activeDayModal.focusName}
                                    onChange={(e) => setActiveDayModal({ ...activeDayModal, focusName: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[11px] font-mono text-zinc-400">EMOJI ICON</label>
                                    <button 
                                        onClick={() => setShowDayEmojiPicker(!showDayEmojiPicker)}
                                        className="text-[10px] text-amber-400 hover:underline"
                                    >
                                        {showDayEmojiPicker ? 'Tutup Pilihan' : 'Pilih Emoji'}
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    value={activeDayModal.emoji}
                                    onChange={(e) => setActiveDayModal({ ...activeDayModal, emoji: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 mb-2"
                                />
                                {showDayEmojiPicker && (
                                    <div className="grid grid-cols-8 gap-1 p-2 bg-black/60 border border-zinc-800 rounded-xl max-h-36 overflow-y-auto">
                                        {POPULAR_EMOJIS.map((em, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => {
                                                    setActiveDayModal({ ...activeDayModal, emoji: em });
                                                    setShowDayEmojiPicker(false);
                                                }}
                                                className="p-1.5 hover:bg-zinc-800 rounded text-center text-sm"
                                            >
                                                {em}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-3 bg-black/40 border border-zinc-800 rounded-xl">
                                <span className="text-xs text-zinc-300 font-medium">Hari Rehat (Rest Day)</span>
                                <input 
                                    type="checkbox"
                                    checked={activeDayModal.isRest}
                                    onChange={(e) => setActiveDayModal({ ...activeDayModal, isRest: e.target.checked })}
                                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                                />
                            </div>

                            {!activeDayModal.isRest && (
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-mono text-zinc-400">PILIHAN SESI FOKUS (TEMPLATES)</label>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                        {templates.map(tpl => {
                                            const isSelected = activeDayModal.focusTemplateIds && activeDayModal.focusTemplateIds.includes(tpl.id);
                                            return (
                                                <div 
                                                    key={tpl.id}
                                                    onClick={() => {
                                                        const current = activeDayModal.focusTemplateIds || [];
                                                        const next = isSelected 
                                                            ? current.filter(id => id !== tpl.id) 
                                                            : [...current, tpl.id];
                                                        setActiveDayModal({ ...activeDayModal, focusTemplateIds: next });
                                                    }}
                                                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer text-xs ${
                                                        isSelected 
                                                            ? 'bg-amber-500/10 border-amber-500 text-amber-300' 
                                                            : 'bg-black/30 border-zinc-800 text-zinc-400'
                                                    }`}
                                                >
                                                    <span className="font-medium">{tpl.emoji} {tpl.name}</span>
                                                    <i className={`fa-solid ${isSelected ? 'fa-check-square text-amber-400' : 'fa-square text-zinc-700'}`}></i>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-3 pt-2">
                            <button 
                                onClick={() => setActiveDayModal(null)}
                                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-all"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={() => handleUpdateDay(activeDayModal)}
                                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-all"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: SUNTING MINGGU */}
            {activeWeekModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <h3 className="font-bold text-white text-sm tracking-wide">Tetapan Minggu Latihan</h3>
                            <button onClick={() => setActiveWeekModal(null)} className="text-zinc-400 hover:text-white p-1">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-mono text-zinc-400 mb-1">TAJUK MINGGU</label>
                                <input 
                                    type="text" 
                                    value={activeWeekModal.title}
                                    onChange={(e) => setActiveWeekModal({ ...activeWeekModal, title: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono text-zinc-400 mb-1">BINTANG PRESTASI</label>
                                <div className="grid grid-cols-4 gap-1 mb-2">
                                    {STAR_PRESETS.map((st, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => setActiveWeekModal({ ...activeWeekModal, stars: st })}
                                            className={`p-1.5 rounded border text-xs text-center ${
                                                activeWeekModal.stars === st ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-black border-zinc-800 text-zinc-400'
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                                <input 
                                    type="text" 
                                    value={activeWeekModal.stars}
                                    onChange={(e) => setActiveWeekModal({ ...activeWeekModal, stars: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 pt-2">
                            <button 
                                onClick={() => setActiveWeekModal(null)}
                                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-all"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={() => handleUpdateWeek(activeWeekModal)}
                                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-all"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: SUNTING TEMPLATE / SESI FOKUS */}
            {activeTemplateModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <h3 className="font-bold text-white text-sm tracking-wide">Tetapan Sesi Fokus</h3>
                            <button onClick={() => setActiveTemplateModal(null)} className="text-zinc-400 hover:text-white p-1">
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-mono text-zinc-400 mb-1">NAMA SESI</label>
                                <input 
                                    type="text" 
                                    value={activeTemplateModal.name}
                                    onChange={(e) => setActiveTemplateModal({ ...activeTemplateModal, name: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono text-zinc-400 mb-1">EMOJI</label>
                                <input 
                                    type="text" 
                                    value={activeTemplateModal.emoji}
                                    onChange={(e) => setActiveTemplateModal({ ...activeTemplateModal, emoji: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 mb-2"
                                />
                                <div className="grid grid-cols-8 gap-1 p-2 bg-black/60 border border-zinc-800 rounded-xl max-h-28 overflow-y-auto">
                                    {POPULAR_EMOJIS.map((em, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => setActiveTemplateModal({ ...activeTemplateModal, emoji: em })}
                                            className="p-1.5 hover:bg-zinc-800 rounded text-center text-sm"
                                        >
                                            {em}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-mono text-zinc-400">SENARAI AKTIVITI / SENAMAN</label>
                                    <button 
                                        onClick={() => {
                                            const newAct = { id: `act_${Date.now()}`, name: 'Senaman Baru', reps: '12 Reps' };
                                            setActiveTemplateModal({
                                                ...activeTemplateModal,
                                                activities: [...(activeTemplateModal.activities || []), newAct]
                                            });
                                        }}
                                        className="text-[10px] text-amber-400 hover:underline font-bold"
                                    >
                                        + Tambah Aktiviti
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {(activeTemplateModal.activities || []).map((act, index) => (
                                        <div key={act.id || index} className="flex items-center space-x-2 bg-black/40 border border-zinc-800 p-2 rounded-xl">
                                            <input 
                                                type="text" 
                                                value={act.name}
                                                onChange={(e) => {
                                                    const updatedActs = [...activeTemplateModal.activities];
                                                    updatedActs[index].name = e.target.value;
                                                    setActiveTemplateModal({ ...activeTemplateModal, activities: updatedActs });
                                                }}
                                                placeholder="Nama Senaman"
                                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                                            />
                                            <input 
                                                type="text" 
                                                value={act.reps}
                                                onChange={(e) => {
                                                    const updatedActs = [...activeTemplateModal.activities];
                                                    updatedActs[index].reps = e.target.value;
                                                    setActiveTemplateModal({ ...activeTemplateModal, activities: updatedActs });
                                                }}
                                                placeholder="Reps / Masa"
                                                className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500 font-mono"
                                            />
                                            <button 
                                                onClick={() => {
                                                    const updatedActs = activeTemplateModal.activities.filter((_, i) => i !== index);
                                                    setActiveTemplateModal({ ...activeTemplateModal, activities: updatedActs });
                                                }}
                                                className="text-zinc-500 hover:text-red-400 p-1.5"
                                            >
                                                <i className="fa-solid fa-trash-can text-xs"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 pt-2">
                            <button 
                                onClick={() => setActiveTemplateModal(null)}
                                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-all"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={() => {
                                    setTemplates(prev => {
                                        const exists = prev.some(t => t.id === activeTemplateModal.id);
                                        if (exists) {
                                            return prev.map(t => t.id === activeTemplateModal.id ? activeTemplateModal : t);
                                        }
                                        return [...prev, activeTemplateModal];
                                    });
                                    setActiveTemplateModal(null);
                                }}
                                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-all"
                            >
                                Simpan Sesi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: PENGESAHAN HAPUS / RESET */}
            {confirmDeleteModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xs p-6 space-y-4 shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto text-xl">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Tetapan & Reset Data</h3>
                            <p className="text-xs text-zinc-400 mt-1">Pilih tindakan pengurusan storan data tempatan anda.</p>
                        </div>

                        <div className="space-y-2 pt-2">
                            <button 
                                onClick={handleHapusSemuaTicks}
                                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition-all"
                            >
                                Kosongkan Tanda Tik Saja
                            </button>
                            <button 
                                onClick={handleHapusSemuaSampel}
                                className="w-full py-2.5 bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold rounded-xl border border-red-800 transition-all"
                            >
                                Hapus Semua Data (Kosong)
                            </button>
                            <button 
                                onClick={handleHapusKeseluruhanData}
                                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-all shadow-md"
                            >
                                Reset kepada Jadual Asal
                            </button>
                        </div>

                        <button 
                            onClick={() => setConfirmDeleteModal(null)}
                            className="w-full py-2 text-zinc-500 hover:text-zinc-300 text-xs pt-1"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
