export type User = {
    id?: number;
    namaLengkap: string;
    username: string;
    role: string;
};

export const roleOptions = ['admin', 'koordinator_pengawas', 'pengawas', 'jagal', 'kulit', 'cacah_daging', 'cacah_tulang', 'packing', 'distribusi'];