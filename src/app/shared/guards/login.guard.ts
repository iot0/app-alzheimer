import { Injectable } from "@angular/core";
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from "@angular/router";
import { Observable } from "rxjs";
import { UserService } from "../services/user.service";

@Injectable({
  providedIn: "root"
})
export class LoginGuard implements CanActivate, CanLoad {
  constructor(private user: UserService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let isLoggedIn = false;
    if (this.user.isAuthenticated()) isLoggedIn = true;
    // navigate to login page

    if (isLoggedIn) {
      if (state.url === "/login") {
        this.router.navigate(["/home"]);
        return false;
      }
      return true;
    } else {
      if (state.url === "/login") {
        return true;
      } else {
        this.router.navigate(["/login"]);
        return false;
      }
    }
  }
  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    let isLoggedIn = false;
    if (this.user.isAuthenticated()) isLoggedIn = true;
    // navigate to login page

    if (isLoggedIn) {
      if (route.path.includes("login")) {
        this.router.navigate(["/home"]);
        return false;
      }
      return true;
    } else {
      if (route.path.includes("login")) {
        return true;
      } else {
        this.router.navigate(["/login"]);
        return false;
      }
    }
  }
}
