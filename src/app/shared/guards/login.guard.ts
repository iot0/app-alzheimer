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
    return this.checkUser(state.url);
  }
  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkUser(route.path);
  }

  async checkUser(path) {
   let isLoggedIn = await this.user.refreshUserDetails();

    // navigate to login page
    if (isLoggedIn) {
      if (path.includes("login")) {
        this.router.navigate(["/home"]);
        return false;
      }
    }
    return true;
  }
}
