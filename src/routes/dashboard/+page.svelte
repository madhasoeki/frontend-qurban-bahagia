<script lang="ts">
  import { untrack } from "svelte";

  import * as Card from "$lib/components/ui/card/index.js";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { PieChart, Text } from "layerchart";
  import FilterToolbar from "$lib/components/filter-toolbar.svelte";
  import { IconCheck, IconX } from "@tabler/icons-svelte";
  import { useHewanSSE } from "$lib/hooks/use-sse";
  import { formatDuration, formatWaktu } from "$lib/utils/format";
  import { mapHewanData } from "$lib/utils/mapper";
  import type { ProgressHewan } from "$lib/types/hewan";

  let { data } = $props();

  // 1. Ambil initial data dari server sesuai struktur API yang baru
  const initialScorecard = untrack(() => data.initialScorecard || {});
  const initialTable = untrack(() =>
    Array.isArray(data.initialTable) ? data.initialTable : [],
  );

  // 2. Buat state untuk Scorecard
  let scorecard = $state({
    totalSohibul: initialScorecard.total_hewan || 0,
    totalHewanSelesaiKulit: initialScorecard.total_hewan_selesai || 0,
    totalKantong: initialScorecard.total_kantong_packing || 0,
    totalDistribusi: initialScorecard.total_kantong_distribusi || 0,
    waktuMulai: initialScorecard.waktu_mulai || "-",
    waktuSelesai: initialScorecard.waktu_selesai || "-",
  });

  let dataTable = $state<ProgressHewan[]>(initialTable.map(mapHewanData));

  // ==========================================
  // LOGIKA DURASI LIVE (TIMER)
  // ==========================================
  let waktuSekarang = $state(new Date());

  $effect(() => {
    if (
      scorecard.waktuMulai === "-" ||
      (scorecard.waktuSelesai && scorecard.waktuSelesai !== "-")
    ) {
      return;
    }
    const interval = setInterval(() => {
      waktuSekarang = new Date();
    }, 1000);
    return () => clearInterval(interval);
  });

  let durasiText = $derived.by(() => {
    if (!scorecard.waktuMulai || scorecard.waktuMulai === "-") return "-";
    return formatDuration(scorecard.waktuMulai, scorecard.waktuSelesai === "-" ? null : scorecard.waktuSelesai, waktuSekarang.getTime());
  });

  // 3. Chart Data
  let chartData = $derived([
    {
      status: "belum",
      jumlah: Math.max(0, scorecard.totalSohibul - scorecard.totalHewanSelesaiKulit),
      color: "var(--color-belum)",
    },
    {
      status: "selesai",
      jumlah: scorecard.totalHewanSelesaiKulit,
      color: "var(--color-selesai)",
    },
  ]);

  const chartConfig = {
    jumlah: { label: "Jumlah" },
    belum: { label: "Belum Selesai", color: "var(--chart-1)" },
    selesai: { label: "Selesai", color: "var(--chart-3)" },
  } satisfies Chart.ChartConfig;

  // --- Shared badge logic ---
  function formatCellDuration(startIso: string | null | undefined, endIso: string | null | undefined) {
    if (!startIso || startIso === "-") return "Belum Mulai";
    return formatDuration(startIso, (endIso && endIso !== "-") ? endIso : null, waktuSekarang.getTime());
  }

  function getProcessBadgeProps(start: string | null | undefined, end: string | null | undefined): { label: string, variant: "outline" | "secondary" | "default" } {
    if (!start || start === "-") return { label: 'Belum Mulai', variant: 'outline' };
    if (!end || end === "-") return { label: formatCellDuration(start, end), variant: 'secondary' };
    return { label: 'Selesai', variant: 'default' };
  }

  // --- SSE via shared hook ---
  useHewanSSE({
    onHewanUpdate: (raw) => {
      const updated = mapHewanData(raw);
      const index = dataTable.findIndex((h) => h.id === updated.id);
      if (index !== -1) {
        dataTable[index] = updated;
      } else {
        dataTable = [updated, ...dataTable];
      }
    },
    onDashboardUpdate: (d) => {
      scorecard = {
        totalSohibul: d.total_hewan ?? d.TotalHewan ?? 0,
        totalHewanSelesaiKulit: d.total_hewan_selesai ?? d.TotalHewanSelesai ?? 0,
        totalKantong: d.total_kantong_packing ?? d.TotalKantongPacking ?? 0,
        totalDistribusi: d.total_kantong_distribusi ?? d.TotalKantongDistribusi ?? 0,
        waktuMulai: d.waktu_mulai || d.WaktuMulai || "-",
        waktuSelesai: d.waktu_selesai || d.WaktuSelesai || "-",
      };
    },
  });

  // --- Client-side filter ---
  let filterSearch = $state('');
  let filterTipe = $state('');
  let filterJenis = $state('');

  // Extract unique pengawas from data for filter dropdown
  let pengawasList = $derived.by(() => {
    const map = new Map<number, string>();
    for (const row of dataTable) {
      if (row.pengawasId) {
        map.set(row.pengawasId, row.pengawasNama || '');
      }
    }
    return Array.from(map.entries()).map(([id, username]) => ({ id, username }));
  });

  let filteredTable = $derived.by(() => {
    let result = dataTable;
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      result = result.filter((r: any) =>
        r.kodeHewan?.toLowerCase().includes(q) ||
        r.namaSohibul?.some((n: string) => n.toLowerCase().includes(q))
      );
    }
    if (filterTipe) {
      result = result.filter((r: any) => r.tipe?.toLowerCase() === filterTipe.toLowerCase());
    }
    if (filterJenis) {
      result = result.filter((r: any) => r.jenisHewan?.toLowerCase() === filterJenis.toLowerCase());
    }
    return result;
  });

  function handleFilter(filters: { search: string; tipe: string; jenisHewan: string; pengawasIds: string }) {
    filterSearch = filters.search;
    filterTipe = filters.tipe;
    filterJenis = filters.jenisHewan;
  }
</script>

<div class="flex flex-col gap-4 w-full min-w-0 py-4 md:py-0">
  {#snippet ProcessBadge(start: string | null | undefined, end: string | null | undefined)}
    {@const props = getProcessBadgeProps(start, end)}
    <!-- @ts-expect-error variant string union -->
    <Badge variant={props.variant} class="tabular-nums font-mono text-[10px] h-5 px-1.5 whitespace-nowrap">
      {props.label}
    </Badge>
  {/snippet}
  <div class="grid auto-rows-min gap-4 md:grid-cols-3">
    <!-- Donut Chart -->
    <div class="md:col-span-2">
      <Card.Root class="flex flex-col">
        <Card.Header>
          <Card.Title>Progres Pemotongan</Card.Title>
          <Card.Description
            >Persentase hewan yang telah selesai</Card.Description
          >
        </Card.Header>

        <Card.Content class="flex-1 pb-0">
          <Chart.Container
            config={chartConfig}
            class="mx-auto aspect-square max-h-60"
          >
            <PieChart
              data={chartData}
              key="status"
              value="jumlah"
              c="color"
              innerRadius={80}
              padding={10}
              props={{ pie: { motion: "tween" } }}
            >
              {#snippet aboveMarks()}
                <Text
                  value={`${Math.round((scorecard.totalHewanSelesaiKulit / scorecard.totalSohibul) * 100) || 0}%`}
                  textAnchor="middle"
                  verticalAnchor="middle"
                  class="fill-foreground text-3xl! font-bold"
                  dy={3}
                />
              {/snippet}

              {#snippet tooltip()}
                <Chart.Tooltip hideLabel />
              {/snippet}
            </PieChart>
          </Chart.Container>
        </Card.Content>

        <!-- TAMBAHAN LABEL/LEGEND DI BAWAH CHART -->
        <Card.Footer class="flex justify-center gap-8 pt-4 pb-6 text-sm">
          <!-- Label Selesai -->
          <div class="flex items-center gap-2">
            <!-- Indikator Kotak Warna -->
            <span class="h-3 w-3 rounded-sm bg-(--color-chart-3)"></span>
            <span class="text-muted-foreground font-medium">Selesai:</span>
            <span class="text-base font-bold"
              >{scorecard.totalHewanSelesaiKulit}</span
            >
          </div>

          <!-- Label Belum Selesai -->
          <div class="flex items-center gap-2">
            <!-- Indikator Kotak Warna -->
            <span class="h-3 w-3 rounded-sm bg-(--color-chart-1)"></span>
            <span class="text-muted-foreground font-medium">Belum Selesai:</span
            >
            <span class="text-base font-bold"
              >{Math.max(
                0,
                scorecard.totalSohibul - scorecard.totalHewanSelesaiKulit,
              )}</span
            >
          </div>
        </Card.Footer>
      </Card.Root>
    </div>

    <!-- Ringkasan & Waktu -->
    <div class="md:col-span-1 flex flex-col gap-4">
      <Card.Root class="">
        <Card.Header class="pb-2">
          <Card.Title class="text-lg">Ringkasan Total</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-muted-foreground">Hewan</span>
            <span class="text-xl font-bold">{scorecard.totalSohibul} Ekor</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-muted-foreground"
              >Kantong</span
            >
            <span class="text-xl font-bold"
              >{scorecard.totalKantong} Kantong</span
            >
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-muted-foreground"
              >Distribusi</span
            >
            <span class="text-xl font-bold"
              >{scorecard.totalDistribusi} Paket</span
            >
          </div>
        </Card.Content>
      </Card.Root>

      <Card.Root class="">
        <Card.Header class="pb-2">
          <Card.Title class="text-lg">Waktu Operasional</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-xs text-muted-foreground font-semibold"
              >MULAI</span
            >
            {#if !scorecard.waktuMulai || scorecard.waktuMulai === "-"}
              <Badge variant="destructive">Belum Mulai</Badge>
            {:else}
              <span class="text-sm font-medium"
                >{formatWaktu(scorecard.waktuMulai)}</span
              >
            {/if}
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-muted-foreground font-semibold"
              >SELESAI</span
            >
            {#if !scorecard.waktuSelesai || scorecard.waktuSelesai === "-"}
              <Badge variant="destructive">Belum Selesai</Badge>
            {:else}
              <span class="text-sm font-medium"
                >{formatWaktu(scorecard.waktuSelesai)}</span
              >
            {/if}
          </div>
          <div
            class="pt-3 border-t border-muted-foreground/20 mt-1 flex justify-between items-center"
          >
            <span class="text-xs text-muted-foreground font-bold">DURASI</span>
            <span class="text-lg font-bold text-green-600">{durasiText}</span>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>

  <!-- BAGIAN BAWAH: Area Responsif (Table vs Card) -->
  <div class="w-full min-w-0 grid grid-cols-1">
    <h2 class="text-lg font-bold mb-4">Daftar Pemotongan Terkini</h2>

    <FilterToolbar pengawas={pengawasList} onfilter={handleFilter} />

    <!-- TAMPILAN MOBILE: Menggunakan Cards (md:hidden akan menyembunyikan div ini di layar desktop) -->
    <div class="grid grid-cols-1 gap-4 md:hidden">
      {#each filteredTable as row (row.id)}
        {@const tahapSelesai = [
          row.waktuSelesaiJagal,
          row.waktuSelesaiKuliti,
          row.waktuSelesaiCacahDaging,
          row.waktuSelesaiCacahTulang,
          row.waktuSelesaiPacking,
        ].filter(Boolean)}

        {@const persenProgress = Math.round((tahapSelesai.length / 5) * 100)}
        {@const warnaProgress =
          persenProgress === 100
            ? "bg-green-500"
            : persenProgress >= 50
              ? "bg-yellow-400"
              : "bg-red-500"}

        {@const waktuSelesaiTotal =
          tahapSelesai.length === 5
            ? new Date(
                Math.max(...tahapSelesai.map((t) => new Date(t as string).getTime())),
              ).toISOString()
            : null}

        <Card.Root class="border bg-background shadow-sm overflow-hidden pt-0!">
          <Card.Header class="p-4 pb-3 bg-muted/30 border-b">
            <div class="flex justify-between items-center mb-3">
              <span class="font-bold text-lg text-primary"
                >{row.kodeHewan}</span
              >
              <div class="flex gap-2 items-center">
                <Badge variant="outline" class="uppercase text-[10px]">{row.tipe || '-'}</Badge>
                <Badge
                  variant={persenProgress === 100
                    ? "default"
                    : persenProgress > 0
                      ? "secondary"
                      : "outline"}
                >
                  {persenProgress === 100
                    ? "Selesai"
                    : persenProgress > 0
                      ? "Diproses"
                      : "Belum Mulai"}
                </Badge>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div
                class="w-full bg-gray-200 h-2 rounded-full overflow-hidden flex-1"
              >
                <div
                  class="h-2 rounded-full {warnaProgress} transition-all duration-500"
                  style="width: {persenProgress}%"
                ></div>
              </div>
              <span class="text-xs font-bold w-8 text-right"
                >{persenProgress}%</span
              >
            </div>
          </Card.Header>

          <Card.Content class="p-4 flex flex-col gap-5">
            <div>
              <span
                class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider"
                >Sohibul</span
              >
              <p class="font-medium text-sm leading-snug">
                {row.namaSohibul?.join(", ") || "-"}
              </p>
            </div>

            <div
              class="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg border border-border/50"
            >
              <div class="text-center flex flex-col gap-1">
                <span
                  class="text-[10px] text-muted-foreground font-bold uppercase"
                  >Daging</span
                >
                <span class="text-sm font-semibold"
                  >{row.beratDaging ? `${row.beratDaging} Kg` : "-"}</span
                >
              </div>
              <div
                class="text-center flex flex-col gap-1 border-l border-border/50"
              >
                <span
                  class="text-[10px] text-muted-foreground font-bold uppercase"
                  >Tulang</span
                >
                <span class="text-sm font-semibold"
                  >{row.beratTulang ? `${row.beratTulang} Kg` : "-"}</span
                >
              </div>
            </div>

            <div>
              <span
                class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3 block border-b pb-1"
                >Status Tahapan</span
              >
              <div class="grid grid-cols-2 gap-y-4 gap-x-4">
                <div class="flex flex-col items-start gap-1">
                  <span class="text-xs font-medium">Jagal</span>
                  {@render ProcessBadge(row.waktuMulaiJagal, row.waktuSelesaiJagal)}
                </div>
                <div class="flex flex-col items-start gap-1">
                  <span class="text-xs font-medium">Kulit</span>
                  {@render ProcessBadge(row.waktuMulaiKuliti, row.waktuSelesaiKuliti)}
                </div>
                <div class="flex flex-col items-start gap-1">
                  <span class="text-xs font-medium">Daging</span>
                  {@render ProcessBadge(row.waktuMulaiCacahDaging, row.waktuSelesaiCacahDaging)}
                </div>
                <div class="flex flex-col items-start gap-1">
                  <span class="text-xs font-medium">Tulang</span>
                  {@render ProcessBadge(row.waktuMulaiCacahTulang, row.waktuSelesaiCacahTulang)}
                </div>
                <div class="flex flex-col items-start gap-1">
                  <span class="text-xs font-medium">Packing</span>
                  {@render ProcessBadge(row.waktuMulaiPacking, row.waktuSelesaiPacking)}
                </div>
              </div>
            </div>

            <div>
              <span
                class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3 block border-b pb-1"
                >Cek Kelengkapan</span
              >
              <div class="flex flex-wrap gap-2">
                <Badge variant={row.cekKepala ? "default" : "outline"} class="text-[10px] flex gap-1 h-5 px-1.5">
                  {#if row.cekKepala}<IconCheck size={12}/>{:else}<IconX size={12}/>{/if} Kepala
                </Badge>
                <Badge variant={row.cekKaki ? "default" : "outline"} class="text-[10px] flex gap-1 h-5 px-1.5">
                  {#if row.cekKaki}<IconCheck size={12}/>{:else}<IconX size={12}/>{/if} Kaki
                </Badge>
                <Badge variant={row.cekKulit ? "default" : "outline"} class="text-[10px] flex gap-1 h-5 px-1.5">
                  {#if row.cekKulit}<IconCheck size={12}/>{:else}<IconX size={12}/>{/if} Kulit
                </Badge>
                <Badge variant={row.cekEkor ? "default" : "outline"} class="text-[10px] flex gap-1 h-5 px-1.5">
                  {#if row.cekEkor}<IconCheck size={12}/>{:else}<IconX size={12}/>{/if} Ekor
                </Badge>
                <Badge variant={row.cekDistribusi ? "default" : "outline"} class="text-[10px] flex gap-1 h-5 px-1.5">
                  {#if row.cekDistribusi}<IconCheck size={12}/>{:else}<IconX size={12}/>{/if} Dist
                </Badge>
              </div>
            </div>

            {#if row.catatan}
              <div
                class="flex flex-col gap-2 p-3 bg-amber-50/50 rounded-lg border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30"
              >
                  <div>
                    <span
                      class="text-[10px] text-amber-600 font-bold uppercase tracking-wider block mb-0.5"
                      >Catatan</span
                    >
                    <p class="text-xs text-foreground leading-relaxed whitespace-pre-line">
                      {row.catatan}
                    </p>
                  </div>
              </div>
            {/if}

            {#if row.pengawasNama}
              <div class="mt-2 text-xs text-muted-foreground border-t pt-2 border-border/50">
                <span class="font-bold">Pengawas:</span> {row.pengawasNama}
              </div>
            {/if}
          </Card.Content>

          <Card.Footer
            class="p-4 pt-3 bg-muted/10 border-t flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="flex flex-col">
                <span
                  class="text-[10px] text-muted-foreground font-bold uppercase"
                  >Mulai</span
                >
                <span class="text-sm font-mono font-medium"
                  >{formatWaktu(row.waktuMulaiJagal)}</span
                >
              </div>
              <span class="text-muted-foreground/50 font-light">-</span>
              <div class="flex flex-col">
                <span
                  class="text-[10px] text-muted-foreground font-bold uppercase"
                  >Selesai</span
                >
                <span class="text-sm font-mono font-medium"
                  >{formatWaktu(waktuSelesaiTotal)}</span
                >
              </div>
            </div>

            <div class="flex flex-col items-end">
              <span
                class="text-[10px] text-muted-foreground font-bold uppercase mb-1"
                >Durasi Total</span
              >
              <span class="text-sm font-mono font-medium">{formatCellDuration(row.waktuMulaiJagal, waktuSelesaiTotal)}</span>
            </div>
          </Card.Footer>
        </Card.Root>
      {/each}
    </div>

    <!-- TAMPILAN DESKTOP: Menggunakan Table (hidden md:block akan menyembunyikan div ini di layar mobile) -->
    <div
      class="hidden md:block bg-background rounded-lg border w-full overflow-x-auto"
    >
      <Table.Root>
        <Table.Header>
          <Table.Row class="whitespace-nowrap">
            <Table.Head class="min-w-25">Kode<br />Hewan</Table.Head>
            <Table.Head class="min-w-45">Sohibul</Table.Head>

            <Table.Head class="min-w-35 text-center">Penjagalan</Table.Head>
            <Table.Head class="min-w-35 text-center">Pengulitan</Table.Head>
            <Table.Head class="min-w-35 text-center"
              >Cacah<br />Daging</Table.Head
            >
            <Table.Head class="min-w-35 text-center"
              >Cacah<br />Tulang</Table.Head
            >
            <Table.Head class="min-w-40 text-center">Packing</Table.Head>

            <Table.Head class="min-w-37.5 text-center">Progress</Table.Head>

            <Table.Head class="min-w-25 text-center"
              >Berat<br />Daging</Table.Head
            >
            <Table.Head class="min-w-25 text-center"
              >Berat<br />Tulang</Table.Head
            >
            <Table.Head class="min-w-62.5">Catatan</Table.Head>

            <Table.Head class="min-w-30 text-center"
              >Waktu<br />Mulai</Table.Head
            >
            <Table.Head class="min-w-30 text-center"
              >Waktu<br />Selesai</Table.Head
            >
            <Table.Head class="min-w-30 text-center">Durasi</Table.Head>
            
            <Table.Head class="min-w-25 text-center">Tipe</Table.Head>
            <Table.Head class="min-w-45 text-center">Kelengkapan</Table.Head>
            <Table.Head class="min-w-45 text-center">Pengawas</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {#each filteredTable as row (row.id)}
            {@const tahapSelesai = [
              row.waktuSelesaiJagal,
              row.waktuSelesaiKuliti,
              row.waktuSelesaiCacahDaging,
              row.waktuSelesaiCacahTulang,
              row.waktuSelesaiPacking,
            ].filter(Boolean)}

            {@const persenProgress = Math.round(
              (tahapSelesai.length / 5) * 100,
            )}
            {@const warnaProgress =
              persenProgress === 100
                ? "bg-green-500"
                : persenProgress >= 50
                  ? "bg-yellow-400"
                  : "bg-red-500"}

            {@const waktuSelesaiTotal =
              tahapSelesai.length === 5
                ? new Date(
                    Math.max(...tahapSelesai.map((t) => new Date(t as string).getTime())),
                  ).toISOString()
                : null}

            <Table.Row>
              <Table.Cell>{row.kodeHewan}</Table.Cell>
              <Table.Cell>
                {#if row.namaSohibul?.length > 1}
                  <ol class="list-decimal pl-4 space-y-0.5">
                    {#each row.namaSohibul as nama}
                      <li>{nama}</li>
                    {/each}
                  </ol>
                {:else}
                  {row.namaSohibul?.[0] || "-"}
                {/if}
              </Table.Cell>

              <Table.Cell class="text-center">{@render ProcessBadge(row.waktuMulaiJagal, row.waktuSelesaiJagal)}</Table.Cell>
              <Table.Cell class="text-center">{@render ProcessBadge(row.waktuMulaiKuliti, row.waktuSelesaiKuliti)}</Table.Cell>
              <Table.Cell class="text-center">{@render ProcessBadge(row.waktuMulaiCacahDaging, row.waktuSelesaiCacahDaging)}</Table.Cell>
              <Table.Cell class="text-center">{@render ProcessBadge(row.waktuMulaiCacahTulang, row.waktuSelesaiCacahTulang)}</Table.Cell>
              <Table.Cell class="text-center">{@render ProcessBadge(row.waktuMulaiPacking, row.waktuSelesaiPacking)}</Table.Cell>

              <Table.Cell>
                <div class="flex items-center gap-2">
                  <div
                    class="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-2.5 rounded-full {warnaProgress} transition-all duration-500"
                      style="width: {persenProgress}%"
                    ></div>
                  </div>
                  <span
                    class="text-xs font-semibold whitespace-nowrap w-9 text-right"
                    >{persenProgress}%</span
                  >
                </div>
              </Table.Cell>

              <Table.Cell class="text-center"
                >{row.beratDaging ? `${row.beratDaging} Kg` : "-"}</Table.Cell
              >
              <Table.Cell class="text-center"
                >{row.beratTulang ? `${row.beratTulang} Kg` : "-"}</Table.Cell
              >
              <Table.Cell
                class="max-w-62.5 whitespace-pre-line wrap-break-word leading-relaxed text-gray-700"
              >
                {row.catatan || "-"}
              </Table.Cell>

              <Table.Cell class="text-center">
                {#if !row.waktuMulaiJagal}
                  <span class="text-sm text-muted-foreground">-</span>
                {:else}
                  <Badge
                    variant="outline"
                    class="font-mono text-gray-600 bg-background shadow-sm"
                  >
                    {formatWaktu(row.waktuMulaiJagal)}
                  </Badge>
                {/if}
              </Table.Cell>

              <Table.Cell class="text-center">
                {#if !waktuSelesaiTotal}
                  <span class="text-sm text-muted-foreground">-</span>
                {:else}
                  <Badge
                    variant="outline"
                    class="font-mono text-gray-600 bg-background shadow-sm"
                  >
                    {formatWaktu(waktuSelesaiTotal)}
                  </Badge>
                {/if}
              </Table.Cell>

              <Table.Cell class="text-center">
                <span class="text-sm font-mono font-medium">{formatCellDuration(row.waktuMulaiJagal, waktuSelesaiTotal)}</span>
              </Table.Cell>
              
              <Table.Cell class="text-center uppercase text-xs font-medium">
                {row.tipe || "-"}
              </Table.Cell>

              <Table.Cell>
                <div class="flex flex-wrap gap-1 justify-center">
                  <Badge variant={row.cekKepala ? "default" : "outline"} class="text-[10px] flex gap-1 h-5 px-1.5" title="Kepala">
                    {#if row.cekKepala}<IconCheck size={12}/>{:else}<IconX size={12}/>{/if} Kepala
                  </Badge>
                  <Badge variant={row.cekKaki ? "default" : "outline"} class="text-[10px] flex gap-1 h-5 px-1.5" title="Kaki">
                    {#if row.cekKaki}<IconCheck size={12}/>{:else}<IconX size={12}/>{/if} Kaki
                  </Badge>
                  <Badge variant={row.cekKulit ? "default" : "outline"} class="text-[10px] flex gap-1 h-5 px-1.5" title="Kulit">
                    {#if row.cekKulit}<IconCheck size={12}/>{:else}<IconX size={12}/>{/if} Kulit
                  </Badge>
                  <Badge variant={row.cekEkor ? "default" : "outline"} class="text-[10px] flex gap-1 h-5 px-1.5" title="Ekor">
                    {#if row.cekEkor}<IconCheck size={12}/>{:else}<IconX size={12}/>{/if} Ekor
                  </Badge>
                  <Badge variant={row.cekDistribusi ? "default" : "outline"} class="text-[10px] flex gap-1 h-5 px-1.5" title="Distribusi">
                    {#if row.cekDistribusi}<IconCheck size={12}/>{:else}<IconX size={12}/>{/if} Dist
                  </Badge>
                </div>
              </Table.Cell>

              <Table.Cell class="text-center text-xs text-muted-foreground whitespace-nowrap">
                {row.pengawasNama || "-"}
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  </div>
</div>
