import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import type { Competition } from "euroleague-api"
import { CaretDownIcon, CaretUpIcon, CaretUpDownIcon } from "@phosphor-icons/react"

import { latestPlayedRound, useClubs, useRounds, useStandings } from "@/lib/hooks"
import { toStandingRow } from "@/lib/mappers"
import type { StandingRow } from "@/lib/mappers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { QueryError } from "@/components/app/query-error"
import { buildTeamSearch } from "@/lib/team-search"
import { cn } from "@/lib/utils"

interface Props {
  competition: Competition
  season: number
}

const SKELETON_ROW_FALLBACK = 18

const NUMERIC = new Set([
  "gamesPlayed",
  "wins",
  "losses",
  "winPercentage",
  "pointsDifference",
  "pointsFor",
  "pointsAgainst",
])

const COLUMN_IDS = [
  "position",
  "club",
  "gamesPlayed",
  "wins",
  "losses",
  "winPercentage",
  "pointsDifference",
  "pointsFor",
  "pointsAgainst",
] as const

const STATIC_HEADERS: Record<(typeof COLUMN_IDS)[number], string> = {
  position: "#",
  club: "Team",
  gamesPlayed: "GP",
  wins: "W",
  losses: "L",
  winPercentage: "Win%",
  pointsDifference: "+/−",
  pointsFor: "PF",
  pointsAgainst: "PA",
}

const columns: Array<ColumnDef<StandingRow>> = [
  { accessorKey: "position", header: "#", cell: (c) => c.getValue<number>() },
  {
    accessorFn: (row) => row.club?.name ?? "",
    id: "club",
    header: "Team",
    enableSorting: true,
    cell: ({ row }) => {
      const club = row.original.club
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6 rounded-sm">
            <AvatarImage src={club?.crest ?? undefined} alt="" />
            <AvatarFallback className="rounded-sm text-[10px]">
              {club?.code ?? "?"}
            </AvatarFallback>
          </Avatar>
          <span className="truncate font-medium">{club?.name ?? "—"}</span>
        </div>
      )
    },
  },
  { accessorKey: "gamesPlayed", header: "GP" },
  { accessorKey: "wins", header: "W" },
  { accessorKey: "losses", header: "L" },
  {
    accessorKey: "winPercentage",
    header: "Win%",
    cell: (c) => `${c.getValue<number>().toFixed(1)}%`,
  },
  {
    accessorKey: "pointsDifference",
    header: "+/−",
    cell: (c) => {
      const value = c.getValue<number>()
      return value > 0 ? `+${value}` : value
    },
  },
  { accessorKey: "pointsFor", header: "PF" },
  { accessorKey: "pointsAgainst", header: "PA" },
]

function StandingsStaticHeader() {
  return (
    <TableHeader>
      <TableRow>
        {COLUMN_IDS.map((id) => (
          <TableHead key={id} className={cn(NUMERIC.has(id) && "text-right")}>
            {STATIC_HEADERS[id]}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
}

function StandingsTableSkeletonBody({ rowCount }: { rowCount: number }) {
  return (
    <TableBody aria-busy="true" aria-label="Loading standings">
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {COLUMN_IDS.map((id) => (
            <TableCell
              key={id}
              className={cn(NUMERIC.has(id) && "text-right")}
            >
              {id === "club" ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="size-6 rounded-sm" />
                  <Skeleton className="h-4 w-32 max-w-full" />
                </div>
              ) : (
                <Skeleton
                  className={cn(
                    "h-4",
                    id === "position" ? "w-5" : "w-8",
                    NUMERIC.has(id) && "ml-auto",
                  )}
                />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

export function StandingsTable({ competition, season }: Props) {
  const navigate = useNavigate()
  const clubs = useClubs(competition, season)
  const rounds = useRounds(competition, season)
  const round = rounds.data ? latestPlayedRound(rounds.data) : 0
  const standings = useStandings(competition, season, round)

  const [sorting, setSorting] = useState<SortingState>([{ id: "position", desc: false }])

  const rows = useMemo<StandingRow[]>(
    () => (standings.data ?? []).map(toStandingRow),
    [standings.data],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const isLoading = rounds.isPending || standings.isPending
  const skeletonRowCount = clubs.data?.length ?? SKELETON_ROW_FALLBACK

  if (rounds.isError) {
    return <QueryError error={rounds.error} onRetry={() => void rounds.refetch()} />
  }
  if (standings.isError) {
    return <QueryError error={standings.error} onRetry={() => void standings.refetch()} />
  }

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <StandingsStaticHeader />
          <StandingsTableSkeletonBody rowCount={skeletonRowCount} />
        </Table>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const numeric = NUMERIC.has(header.column.id)
                const sortDir = header.column.getIsSorted()
                return (
                  <TableHead key={header.id} className={cn(numeric && "text-right")}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "-ml-2 h-7 gap-1 px-2 data-[numeric=true]:ml-auto",
                        numeric && "ml-auto",
                      )}
                      data-numeric={numeric}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sortDir === "asc" ? (
                        <CaretUpIcon className="size-3" />
                      ) : sortDir === "desc" ? (
                        <CaretDownIcon className="size-3" />
                      ) : (
                        <CaretUpDownIcon className="size-3 opacity-40" />
                      )}
                    </Button>
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const code = row.original.club?.code
            return (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => {
                  if (code) {
                    void navigate({
                      to: "/team/$clubCode",
                      params: { clubCode: code },
                      search: buildTeamSearch({ competition, season }),
                    })
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(NUMERIC.has(cell.column.id) && "text-right tabular-nums")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
