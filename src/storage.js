import { SAVE_KEY, initialState, restoreState } from './engine.js';
export const BACKUP_KEY = `${SAVE_KEY}:before-reset`;
// Protect unreadable/new-version data and another tab's latest work.
export function createRecordStore(storage) {
  let last = null, blocked = false, message = '';
  let state = initialState();
  try {
    last = storage.getItem(SAVE_KEY);
    if (last) {
      const raw = JSON.parse(last);
      if (!raw || raw.version !== 1) throw new Error('unsupported');
      state = restoreState(raw);
      // Old teacher unlocks must not silently reopen student sessions.
      state.unlocked = false;
    }
  } catch {
    blocked = true;
    message = '기존 기록을 읽지 못해 보호 중이야. 새 활동은 임시로만 진행돼. 설정에서 원본 백업 후 새로 시작할 수 있어.';
  }
  return {
    state, get message() { return message; },
    save(next) {
      if (blocked) return false;
      try {
        if (storage.getItem(SAVE_KEY) !== last) {
          blocked = true;
          message = '다른 창에서 기록이 바뀌었어. 덮어쓰지 않도록 저장을 멈췄어. 이 창을 새로고침해 최신 기록을 이어 가 줘.';
          return false;
        }
        const value = JSON.stringify(next);
        storage.setItem(SAVE_KEY, value); last = value;
        return true;
      } catch { message = '저장 공간을 사용할 수 없어. 창을 닫기 전 기록을 확인해 줘.'; return false; }
    },
    reset() {
      try {
        const previous = storage.getItem(SAVE_KEY);
        if (previous !== null) storage.setItem(BACKUP_KEY, previous);
        const fresh = initialState(), value = JSON.stringify(fresh);
        storage.setItem(SAVE_KEY, value);
        last = value; blocked = false; message = ''; return fresh;
      } catch { message = '백업 또는 저장에 실패해 초기화를 멈췄어. 기존 기록은 삭제하지 않았어.'; return null; }
    },
    restoreBackup() {
      try {
        const raw = storage.getItem(BACKUP_KEY);
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== 1) throw new Error('invalid');
        if (storage.getItem(SAVE_KEY) !== last) throw new Error('conflict');
        const restored = restoreState(parsed); restored.unlocked = false;
        const value = JSON.stringify(restored);
        storage.setItem(SAVE_KEY, value); last = value; blocked = false; message = ''; return restored;
      } catch { message = '복구 가능한 백업이 없거나 기록이 바뀌었어. 현재 기록을 유지했어.'; return null; }
    }
  };
}
