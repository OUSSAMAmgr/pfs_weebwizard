import { Link } from "wouter";
import { Building, Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-200 mt-12">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building className="text-primary h-6 w-6" />
              <h2 className="text-xl font-bold text-white">MateriauxPro</h2>
            </div>
            <p className="text-neutral-400 mb-4">
              Votre plateforme d'achat de matériaux de construction professionnels.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white transition duration-150">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white transition duration-150">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white transition duration-150">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white transition duration-150">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">Accueil</span>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">Produits</span>
                </Link>
              </li>
              <li>
                <Link href="/categories">
                  <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">Catégories</span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">À propos</span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Aide</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq">
                  <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">FAQ</span>
                </Link>
              </li>
              <li>
                <Link href="/delivery">
                  <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">Livraison</span>
                </Link>
              </li>
              <li>
                <Link href="/returns">
                  <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">Retours</span>
                </Link>
              </li>
              <li>
                <Link href="/payment">
                  <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">Paiement</span>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">CGV</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-neutral-400" />
                <span>123 Rue de la Construction, 75001 Paris</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-neutral-400" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-neutral-400" />
                <span>contact@materiauxpro.fr</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Newsletter</h4>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Votre email"
                  className="rounded-r-none"
                />
                <Button className="rounded-l-none">S'abonner</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400">© 2023 MateriauxPro. Tous droits réservés.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy">
                <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">Confidentialité</span>
              </Link>
              <Link href="/cookies">
                <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">Cookies</span>
              </Link>
              <Link href="/legal">
                <span className="text-neutral-400 hover:text-white transition duration-150 cursor-pointer">Mentions légales</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
