"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const attendanceStatuses = ["Hadir", "Izin", "Sakit", "Alpa"];

export default function AttendancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Absensi</h1>
          <p className="text-muted-foreground">
            Tanggal {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
          </p>
        </div>
        <Button variant="outline">Tandai Semua Hadir</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Siswa</TableHead>
                <TableHead className="text-center w-[400px]">
                  Status Kehadiran
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">John Doe</div>
                  </div>
                </TableCell>
                <TableCell>
                  <RadioGroup defaultValue="Hadir" className="flex justify-center gap-2 md:gap-4 flex-wrap">
                    {attendanceStatuses.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <RadioGroupItem value={status} id={`1-${status}`} />
                        <Label htmlFor={`1-${status}`}>{status}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">Jane Smith</div>
                  </div>
                </TableCell>
                <TableCell>
                  <RadioGroup defaultValue="Hadir" className="flex justify-center gap-2 md:gap-4 flex-wrap">
                    {attendanceStatuses.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <RadioGroupItem value={status} id={`2-${status}`} />
                        <Label htmlFor={`2-${status}`}>{status}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button>Simpan Absensi</Button>
      </div>
    </div>
  );
}
