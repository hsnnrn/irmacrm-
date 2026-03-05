"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Plus,
  MoreHorizontal,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  Pencil,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { USER_ROLES, ROLE_LABELS, ROLE_COLORS } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  last_sign_in: string | null;
  is_active: boolean;
}

async function apiCall(
  url: string,
  options: RequestInit,
  token: string
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });
  const [editRole, setEditRole] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      const { supabase } = await import("@/lib/supabase");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        setToken(session.access_token);
      }
    };
    getToken();
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiCall("/api/users", { method: "GET" }, token);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, fetchUsers]);

  const handleCreateUser = async () => {
    if (!token) return;
    if (!newUser.email || !newUser.password || !newUser.role) {
      toast({
        title: "Hata",
        description: "Tüm zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiCall(
        "/api/users/create",
        { method: "POST", body: JSON.stringify(newUser) },
        token
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Başarılı", description: "Kullanıcı oluşturuldu." });
      setCreateDialogOpen(false);
      setNewUser({ full_name: "", email: "", password: "", role: "EMPLOYEE" });
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!token || !selectedUser) return;
    setSubmitting(true);
    try {
      const res = await apiCall(
        `/api/users/${selectedUser.id}`,
        { method: "PATCH", body: JSON.stringify({ role: editRole }) },
        token
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Başarılı", description: "Rol güncellendi." });
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (u: UserItem) => {
    if (!token) return;
    try {
      const res = await apiCall(
        `/api/users/${u.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ is_active: !u.is_active }),
        },
        token
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({
        title: "Başarılı",
        description: u.is_active
          ? "Kullanıcı pasif yapıldı."
          : "Kullanıcı aktif edildi.",
      });
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async () => {
    if (!token || !selectedUser) return;
    setSubmitting(true);
    try {
      const res = await apiCall(
        `/api/users/${selectedUser.id}`,
        { method: "DELETE" },
        token
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: "Başarılı", description: "Kullanıcı silindi." });
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Kullanıcı Yönetimi
            </h1>
            <p className="text-gray-500">
              Sistem kullanıcılarını görüntüleyin ve yönetin
            </p>
          </div>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Yeni Kullanıcı
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
              <DialogDescription>
                Sisteme yeni bir kullanıcı ekleyin. Tüm alanlar zorunludur.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Ad Soyad</Label>
                <Input
                  id="full_name"
                  placeholder="Ahmet Yılmaz"
                  value={newUser.full_name}
                  onChange={(e) =>
                    setNewUser((p) => ({ ...p, full_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  E-posta <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="kullanici@irmaglobal.com"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Şifre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="En az 6 karakter"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser((p) => ({ ...p, password: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Rol <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newUser.role}
                  onValueChange={(v) =>
                    setNewUser((p) => ({ ...p, role: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                İptal
              </Button>
              <Button onClick={handleCreateUser} disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Kullanıcılar</CardTitle>
          </div>
          <CardDescription>
            Toplam {users.length} kullanıcı kayıtlı
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Son Giriş</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {u.id === user?.id && (
                          <span className="text-xs text-gray-400">(Siz)</span>
                        )}
                        {u.full_name || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{u.email}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          ROLE_COLORS[u.role as keyof typeof ROLE_COLORS] ||
                            "bg-gray-100 text-gray-700"
                        )}
                      >
                        {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ||
                          u.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.is_active ? "default" : "secondary"}
                        className={
                          u.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {u.is_active ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {u.last_sign_in
                        ? formatDate(u.last_sign_in)
                        : "Hiç giriş yapmadı"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(u.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.id !== user?.id ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(u);
                                setEditRole(u.role);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Rol Değiştir
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(u)}
                            >
                              {u.is_active ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Pasif Yap
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Aktif Et
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedUser(u);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-xs text-gray-400 pr-4">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rol Değiştir</DialogTitle>
            <DialogDescription>
              {selectedUser?.email} kullanıcısının rolünü güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Yeni Rol</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              İptal
            </Button>
            <Button onClick={handleUpdateRole} disabled={submitting}>
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedUser?.email}</strong> kullanıcısını kalıcı olarak
              silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteUser}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
