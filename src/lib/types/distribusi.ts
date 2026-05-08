export interface DistribusiUser {
    id: number;
    userId: number;
    jumlahKantong: number;
    user?: {
        id: number;
        username: string;
        namaLengkap: string;
        role: string;
    };
}
