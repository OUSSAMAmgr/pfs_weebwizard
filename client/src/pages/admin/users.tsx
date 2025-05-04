import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Ban, Check, Lock, MoreVertical, Search, Trash2, Unlock, UserCog, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [userType, setUserType] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  
  // Fetch users
  const {
    data: users,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users", { search: searchQuery, type: userType }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const queryParams = new URLSearchParams();
      
      if (params.search) {
        queryParams.append("q", params.search as string);
      }
      
      if (params.type && params.type !== "all") {
        queryParams.append("role", params.type as string);
      }
      
      const url = `/api/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      refetchUsers();
      
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
        variant: "default",
      });
      
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Block/Unblock user mutation
  const toggleBlockUserMutation = useMutation({
    mutationFn: async ({ userId, blocked }: { userId: number; blocked: boolean }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/toggle-block`, { blocked });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      refetchUsers();
      
      toast({
        title: selectedUser?.blocked ? "Utilisateur débloqué" : "Utilisateur bloqué",
        description: selectedUser?.blocked 
          ? "L'utilisateur a été débloqué avec succès." 
          : "L'utilisateur a été bloqué avec succès.",
        variant: "default",
      });
      
      setIsBlockDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchUsers();
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleBlockUser = (user: User) => {
    setSelectedUser(user);
    setIsBlockDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const confirmToggleBlock = () => {
    if (selectedUser) {
      toggleBlockUserMutation.mutate({ 
        userId: selectedUser.id, 
        blocked: !selectedUser.blocked 
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "supplier":
        return "bg-blue-100 text-blue-800";
      case "client":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeClass = (blocked?: boolean) => {
    return blocked
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "supplier":
        return "Fournisseur";
      case "client":
        return "Client";
      default:
        return role;
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-4 lg:mb-0">Gestion des utilisateurs</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher un utilisateur..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Rechercher</Button>
          </form>
          
          <Button variant="outline" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      {/* User Type Tabs */}
      <Tabs 
        value={userType} 
        onValueChange={setUserType} 
        className="mb-6"
        onValueChangeCapture={() => setTimeout(refetchUsers, 100)} // Auto-refresh on tab change
      >
        <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="supplier">Fournisseurs</TabsTrigger>
          <TabsTrigger value="client">Clients</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : !users || users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className={user.blocked ? "bg-red-50/30" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                          <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeClass(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(user.blocked)}>
                        {user.blocked ? "Bloqué" : "Actif"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <UserCog className="mr-2 h-4 w-4" />
                            Éditer le profil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleBlockUser(user)}>
                            {user.blocked ? (
                              <>
                                <Unlock className="mr-2 h-4 w-4" />
                                Débloquer l'utilisateur
                              </>
                            ) : (
                              <>
                                <Lock className="mr-2 h-4 w-4" />
                                Bloquer l'utilisateur
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer l'utilisateur
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement l'utilisateur "{selectedUser?.username}" et toutes ses données associées. Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteUserMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block/Unblock User Dialog */}
      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.blocked
                ? "Débloquer cet utilisateur ?"
                : "Bloquer cet utilisateur ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.blocked
                ? `Cette action débloquera l'utilisateur "${selectedUser?.username}" et lui permettra d'accéder à nouveau à son compte.`
                : `Cette action bloquera l'utilisateur "${selectedUser?.username}" et l'empêchera d'accéder à son compte.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleBlock}>
              {toggleBlockUserMutation.isPending ? (
                "Traitement en cours..."
              ) : selectedUser?.blocked ? (
                <div className="flex items-center">
                  <Unlock className="mr-2 h-4 w-4" />
                  Débloquer
                </div>
              ) : (
                <div className="flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  Bloquer
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
