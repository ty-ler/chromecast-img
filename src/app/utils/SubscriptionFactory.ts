import { BehaviorSubject, Subject, Subscription, Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

/**
 * Class to manage component-lifetime-specific subscriptions.
 */
export class SubscriptionFactory {
  private listening: boolean;
  private subscriptions: Subscription[] = []; // List of active subscriptions.

  constructor() {
    // Begin listening immediately.
    this.listening = true;
  }

  /**
   * Stop listening and unsubscribe from all active subscriptions.
   */
  public stopListening() {
    this.listening = false;
    this.unsubscribeAll();
  }

  /**
   * Get the current listening status.
   */
  public isListening() {
    return this.listening;
  }

  /**
   * Get the list of all the active subscriptions.
   */
  public getSubscriptions() {
    return this.subscriptions;
  }

  /**
   * Create a subscription to an Observable-type object which will last
   * while the factory instance is listening, and add it to the list of
   * active subscriptions to easily manage.
   *
   * @param subject - Observable-type object which will be subscribed to.
   * @param callback - The callback method passed to the subcribe method which.
   * should expect a parameter for the emitted value.
   */
  public subscribe(
    subject: BehaviorSubject<any> | Subject<any> | Observable<any>,
    callback: any
  ) {
    const subscription = subject
      .pipe(
        // Use takeWhile to listen to the subscription
        // when the factory instance is listening.
        takeWhile(() => this.listening)
      )
      .subscribe((e) => callback(e));

    // Add to subscription array.
    this.subscriptions.push(subscription);

    return subscription;
  }

  /**
   * Unsubscribe from all active subscriptions.
   */
  public unsubscribeAll() {
    this.subscriptions.map((subscription) => subscription.unsubscribe());
  }
}
