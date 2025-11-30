export const ROLES = {
  ADMIN: 'ADMIN',
  GURU: 'GURU',
  SISWA: 'SISWA',
  GUEST: 'GUEST'
};

// Email Admin Utama (Backup jika database bermasalah)
const SUPER_ADMIN_EMAIL = "rafiantara@gmail.com";

export const canAccess = (user, action) => {
  // 1. JIKA BELUM LOGIN
  if (!user) return false;

  // 2. CEK SUPER ADMIN
  const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;

  // 3. BLOKIR STATUS PENDING (Kecuali Super Admin)
  if (!isSuperAdmin && user.status !== 'ACTIVE' && user.status !== 'BANNED') return false;

  // Tentukan Role
  const role = isSuperAdmin ? ROLES.ADMIN : user.role;

  switch (action) {
    // --- FITUR MANAJEMEN KELAS ---
    case 'MANAGE_KAS':
    case 'INPUT_ABSEN':
    case 'MANAGE_TUGAS':
    case 'MANAGE_PIKET':
    case 'MANAGE_JADWAL':
    case 'MANAGE_STRUKTUR':
      return role === ROLES.ADMIN || role === ROLES.GURU;

    // --- FITUR KONTEN ---
    case 'POST_NEWS':
    case 'UPLOAD_GALERI':
    case 'BROADCAST_INFO':
    case 'MANAGE_COUNTDOWN':
      return role === ROLES.ADMIN || role === ROLES.GURU;

    // --- FITUR AI & CHAT ---
    case 'USE_AI_CHAT':
      return role === ROLES.SISWA || role === ROLES.GURU || role === ROLES.ADMIN;

    // --- PENGATURAN & ADMIN ---
    case 'CONFIGURE_AI_SYSTEM': // Setting API Key
      return role === ROLES.ADMIN;

    case 'MANAGE_CLASS_SETTINGS': // Data Siswa
      return role === ROLES.ADMIN || role === ROLES.GURU;

    case 'APPROVE_USER':
      return role === ROLES.ADMIN || role === ROLES.GURU;

    case 'UPLOAD_SHOWCASE':
      return role === ROLES.SISWA || role === ROLES.GURU || role === ROLES.ADMIN;

    // --- GOD MODE (NEW) ---
    case 'MANAGE_ALL_USERS':
      return role === ROLES.ADMIN;

    default:
      return false;
  }
};