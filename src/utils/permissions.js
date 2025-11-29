export const  ROLES = {
  ADMIN: 'ADMIN' ,
  GURU: 'GURU' ,
  SISWA: 'SISWA' ,
  GUEST: 'GUEST'
};

// Email Admin Utama (Backup jika database bermasalah)
const SUPER_ADMIN_EMAIL = "rafiantara@gmail.com" ;

export const canAccess = (user, action) =>  {
  // 1. JIKA BELUM LOGIN (TAMU)
  if  (!user) {
    // Tamu tidak punya hak akses khusus
    return false ;
  }

  // 2. CEK SUPER ADMIN & STATUS
  const  isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
  // Jika bukan super admin, dan akun belum di-ACC (Pending), tolak akses
  if (!isSuperAdmin && user.status !== 'ACTIVE') return false ;

  const  role = isSuperAdmin ? ROLES.ADMIN : user.role;

  // 3. ATURAN MAIN (RULES)
  switch  (action) {
    
    // --- FITUR DASHBOARD (CRUD) ---
    // Siapa yang boleh Edit/Hapus/Tambah data di Dashboard?
    case 'MANAGE_KAS':        // Input Kas
    case 'INPUT_ABSEN':       // Input Absen
    case 'POST_NEWS':         // Post Berita
    case 'UPLOAD_GALERI':     // Upload Galeri
    case 'MANAGE_TUGAS':      // Tambah Tugas
    case 'MANAGE_USERS':      // Atur Jadwal/Piket
      // HANYA Admin dan Guru
      return  role === ROLES.ADMIN || role === ROLES.GURU;

    // --- AKSES MASUK DASHBOARD ---
    case 'VIEW_DASHBOARD' :
      // Siswa, Guru, Admin boleh masuk. Tamu TIDAK boleh.
      return  role === ROLES.SISWA || role === ROLES.GURU || role === ROLES.ADMIN;

    // --- PENGATURAN (SETTINGS) ---
    case 'VIEW_SETTINGS_ALL': // Tab AI & API
      // HANYA Admin
      return  role === ROLES.ADMIN;

    case 'VIEW_SETTINGS_CLASS': // Tab Data Kelas
      // Admin dan Guru
      return  role === ROLES.ADMIN || role === ROLES.GURU;

    // --- FITUR SPESIAL SISWA ---
    case 'UPLOAD_SHOWCASE':   // Upload Project
    case 'USE_AI_CHAT':       // Chat Bot
      // Siswa, Guru, Admin boleh
      return  role === ROLES.SISWA || role === ROLES.GURU || role === ROLES.ADMIN;

    // --- FITUR APPROVAL ---
    case 'APPROVE_SISWA':     // Terima Siswa Baru
      return  role === ROLES.GURU || role === ROLES.ADMIN;
    
    case 'APPROVE_GURU':      // Terima Guru Baru
      return  role === ROLES.ADMIN;

    default :
      return false ;
  }
};